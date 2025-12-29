// src/routes/game.routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Server } from 'socket.io';
import { db } from '../database/memoryDB';
import { GameInviteSchema, GameInviteInput, GameResponseSchema, GameResponseInput } from '../schemas/game.schemas';
import { rankedMatchmakingRouteSchema, inviteFriendRouteSchema, respondInviteRouteSchema } from '../schemas/swagger/game.route.schemas';

interface RankedQueueItem {
    userId: number;
    score: number;
    timestamp: number;
}

// Fila em memória
let rankedQueue: RankedQueueItem[] = [];
const pendingInvites = new Map<string, number>();

// HELPER CORRIGIDO: Usa '==' para aceitar string ou number
function findSocketByUserId(io: Server, userId: number) {
    // console.log(`[DEBUG] Buscando socket para UserID: ${userId}`);
    
    for (const [_, socket] of io.sockets.sockets) {
        // A mágica está aqui: '==' em vez de '==='
        if (socket.data?.id == userId) {
            return socket;
        }
    }
    return undefined;
}

export async function gameRoutes(app: FastifyInstance, options: { io: Server }) {
    const io = options.io;

    const verifyUser = async (req: FastifyRequest, reply: FastifyReply) => {
        const user = await db.findUserById(req.user.id);
        if (!user) return reply.code(404).send({ error: 'Usuário não autenticado' });
        return user;
    };

    // --- ROTA DE MATCHMAKING (GET) ---
    app.get('/ranked', {
        onRequest: [app.authenticate],
        schema: rankedMatchmakingRouteSchema
    }, async (req: FastifyRequest, reply) => {
        const currentUser = (await verifyUser(req, reply))!;
        
        // 1. Remove o usuário atual da fila se ele já estiver lá (para evitar jogar contra si mesmo)
        rankedQueue = rankedQueue.filter(item => item.userId !== currentUser.id);

        const SCORE_RANGE = 10000; // Range alto para facilitar testes

        // 2. Loop de busca com AUTO-LIMPEZA
        // Vamos procurar até achar um oponente válido ou acabar a fila
        let opponentIndex = -1;
        
        while (true) {
            // Tenta achar alguém compatível
            opponentIndex = rankedQueue.findIndex(opponent => 
                Math.abs(opponent.score - (currentUser.score || 0)) <= SCORE_RANGE
            );

            // Se não achou ninguém, para o loop
            if (opponentIndex === -1) break;

            const opponentItem = rankedQueue[opponentIndex];

            // ACHOU ALGUÉM! Agora verifica se o socket dele está vivo.
            const opponentSocket = findSocketByUserId(io, opponentItem.userId);

            if (opponentSocket) {
                // SUCESSO! Oponente existe e está conectado.
                
                // Remove o oponente da fila
                rankedQueue.splice(opponentIndex, 1);

                const roomId = `ranked_${Math.min(currentUser.id, opponentItem.userId)}_${Math.max(currentUser.id, opponentItem.userId)}_${Date.now()}`;

                // Avisa o oponente via Socket
                opponentSocket.emit('matchFound', { 
                    roomId, 
                    opponentId: currentUser.id,
                    message: "Oponente encontrado!"
                });

                console.log(`[MATCH] ${currentUser.nick} vs ${opponentItem.userId} na sala ${roomId}`);

                // Retorna para o usuário atual (via HTTP)
                return reply.send({
                    status: 'match_found',
                    roomId: roomId,
                    opponentId: opponentItem.userId,
                    message: 'Oponente encontrado! Conectando...'
                });
            } else {
                // FALHA: Oponente estava na fila, mas o socket sumiu (Refresh/Desconectou)
                console.log(`[CLEANUP] Removendo usuário fantasma ${opponentItem.userId} da fila.`);
                
                // Remove esse usuário morto da fila e CONTINUA o loop para tentar o próximo
                rankedQueue.splice(opponentIndex, 1);
            }
        }

        // Se chegou aqui, não achou ninguém válido
        rankedQueue.push({
            userId: currentUser.id,
            score: currentUser.score || 0,
            timestamp: Date.now()
        });

        console.log(`[QUEUE] ${currentUser.nick} entrou na fila. Total esperando: ${rankedQueue.length}`);

        return reply.send({
            status: 'queued',
            message: 'Você entrou na fila. Aguardando oponente...'
        });
    });

    // ... (Mantenha as rotas de invite/casual iguais) ...
    // --- ROTA: CONVIDAR AMIGO (CASUAL) ---
    app.post('/casual/invite', {
        onRequest: [app.authenticate],
        schema: inviteFriendRouteSchema,
        preHandler: [app.validateBody(GameInviteSchema)]
    }, async (req: FastifyRequest, reply) => {
        const { nick } = req.body as GameInviteInput;
        const sender = (await verifyUser(req, reply))!;

        const target = db.findUserByNick(nick);
        if (!target) return reply.code(404).send({ error: 'Usuário não encontrado' });

        if (!sender.friends.includes(target.id)) {
            return reply.code(403).send({ error: 'Você só pode convidar amigos.' });
        }

        const inviteKey = `${sender.id}:${target.id}`;
        pendingInvites.set(inviteKey, Date.now());

        // 3: Enviar evento Socket para o convidado ver o popup em tempo real
        const targetSocket = findSocketByUserId(io, target.id);
        if (targetSocket) {
            targetSocket.emit('gameInvite', {
                from: sender.nick,
                fromId: sender.id,
                message: `${sender.nick} te convidou para uma partida!`
            });
        }

        return reply.send({
            status: 'invited',
            message: `Convite enviado para ${target.nick}.`
        });
    });

    // --- ROTA: RESPONDER CONVITE (CASUAL) ---
    app.post('/casual/response', {
        onRequest: [app.authenticate],
        schema: respondInviteRouteSchema,
        preHandler: [app.validateBody(GameResponseSchema)]
    }, async (req: FastifyRequest, reply) => {
        const { nick, action } = req.body as GameResponseInput;
        const currentUser = (await verifyUser(req, reply))!; // Quem aceitou

        const sender = db.findUserByNick(nick); // Quem convidou
        if (!sender) return reply.code(404).send({ error: 'Remetente não encontrado' });

        const inviteKey = `${sender.id}:${currentUser.id}`;
        
        if (!pendingInvites.has(inviteKey)) {
            return reply.code(400).send({ error: 'Convite expirado ou inválido.' });
        }

        pendingInvites.delete(inviteKey);

        if (action === 'decline') {
            // Avisar o remetente que foi recusado
            const senderSocket = findSocketByUserId(io, sender.id);
            if (senderSocket) {
                senderSocket.emit('inviteDeclined', { 
                    by: currentUser.nick,
                    message: 'Seu convite foi recusado.'
                });
            }
            return reply.send({ status: 'declined', message: 'Convite recusado.' });
        }

        if (action === 'accept') {
            const roomId = `casual_${sender.id}_${currentUser.id}_${Date.now()}`;

            // 4: Avisar quem convidou (Sender) que foi aceito e passar o roomId
            const senderSocket = findSocketByUserId(io, sender.id);
            if (senderSocket) {
                senderSocket.emit('inviteAccepted', { 
                    roomId, 
                    opponentId: currentUser.id,
                    message: 'Convite aceito! Entrando na sala...'
                });
            }

            // Retorna para quem aceitou (CurrentUser) conectar também
            return reply.send({
                status: 'accepted',
                roomId: roomId,
                opponentId: sender.id,
                message: 'Convite aceito! Iniciando jogo...'
            });
        }
    });

    app.post('/queue/leave', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    rankedQueue = rankedQueue.filter(u => u.userId !== userId);
    console.log(`[QUEUE] Usuário ${userId} saiu da fila manualmente.`);
    return reply.send({ message: 'Saiu da fila.' });
});
}