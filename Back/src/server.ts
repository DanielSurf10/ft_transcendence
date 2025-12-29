import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { Server, Socket } from 'socket.io'

import { PongMatch } from './game/PongMatch'
import swaggerPlugin from './plugins/swagger'
import zodValidator from './plugins/zod-validator'
import { authRoutes } from './routes/auth.routes'
import { friendsRoutes } from './routes/friends.routes'
import { gameRoutes } from './routes/game.routes'
import { leaderboardRoutes } from './routes/leaderboard.routes'
import { usersRoutes } from './routes/users.routes'

dotenv.config()

declare module 'fastify' {
    interface FastifyJWT {
        payload: {
            id: number
            email: string
            nick: string
            isAnonymous: boolean
            gang: string
            temp2FA?: boolean
        }
        user: {
            id: number
            email: string
            nick: string
            isAnonymous: boolean
            gang: string
            temp2FA?: boolean
        }
    }
}

const app = fastify({ logger: false })

let waitingPlayer: Socket | null = null

const activeMatches: Map<string, PongMatch> = new Map()

// Configuração do CORS
app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})

app.register(jwt, { secret: process.env.JWT_SECRET || 'JWT_SECRET' })
app.register(swaggerPlugin)


// --- DECORATORS DE AUTENTICAÇÃO ---
app.decorate('authenticate', async function (req: FastifyRequest, reply: FastifyReply) {
    try {
        await req.jwtVerify()
        if (req.user.temp2FA) {
            return reply.code(401).send({ error: 'Token temporário. Complete o 2FA.' })
        }
    } catch (err) {
        return reply.code(401).send({ error: 'Token Inválido ou Expirado' })
    }
})

app.decorate('authenticate2FA', async function (req: FastifyRequest, reply: FastifyReply) {
    try {
        await req.jwtVerify()
        if (!req.user.temp2FA) {
            return reply.code(401).send({ error: 'Token inválido para etapa 2FA' })
        }
    } catch (err) {
        return reply.code(401).send({ error: 'Token Inválido' })
    }
})

// --- REGISTRO DE ROTAS ---
app.register(zodValidator)

app.register(authRoutes, { prefix: '/auth' })
app.register(friendsRoutes, { prefix: '/friends' })
app.register(leaderboardRoutes, { prefix: '/leaderboards' })
app.register(usersRoutes, { prefix: '/users' })


// --- INICIALIZAÇÃO DO SERVIDOR E SOCKET.IO ---
const start = async () => {
    try {
        
        const io = new Server(app.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        })
        app.register(gameRoutes, { prefix: '/game', io: io })
        await app.ready()
        
        io.on('connection', (socket: Socket) => {
            console.log(`\n[SOCKET] Nova conexão recebida: ${socket.id}`);

            // LOG 1: Ver se o token está chegando do frontend
            const tokenRecebido = socket.handshake.auth.token;
            console.log(`[SOCKET] Token recebido:`, tokenRecebido ? "Sim (Ocultado)" : "NÃO RECEBIDO (Undefined)");

            let userData: any = {};

            try {
                if (tokenRecebido) {
                    // LOG 2: Tentar decodificar
                    const decoded = app.jwt.decode(tokenRecebido);
                    // console.log(`[SOCKET] Token Decodificado:`, JSON.stringify(decoded, null, 2));

                    if (decoded && typeof decoded === 'object') {
                        userData = decoded;
                    }
                } else {
                    console.log(`[SOCKET] ⚠️ ALERTA: Cliente conectou sem token!`);
                }
            } catch (e) {
                console.error(`[SOCKET] Erro ao decodificar token:`, e);
            }

            // Salva no socket
            socket.data = { ...userData, socketId: socket.id };
            
            // LOG 3: Confirmar o que ficou salvo no socket
            console.log(`[SOCKET] Dados finais salvos no socket ${socket.id}: ID=${socket.data.id}, Nick=${socket.data.nick}`);
            
            // ---------------------------------------------------------
            // EVENTO 1: Entrar em Sala Específica (Ranked ou Convite)
            // O frontend emite isso após receber o 'roomId' da API HTTP
            // ---------------------------------------------------------
            socket.on('joinGame', (data: { roomId: string }) => {
                const roomId = data.roomId;
				console.log(`[SOCKET] ${socket.data.nick} entrando na sala: ${roomId}`); // LOG NOVO

                socket.join(roomId); // Socket entra na sala do Socket.IO
                
                const room = io.sockets.adapter.rooms.get(roomId);
                
                if (room) {
                    console.log(`[SOCKET] Sala ${roomId} agora tem ${room.size} jogadores.`);
                    
                    // Se a sala tiver 2 jogadores, inicia a partida
                    if (room.size === 2) {
                        console.log(`[GAME START] Iniciando partida na sala ${roomId}`);
                        const [id1, id2] = Array.from(room);
                        
                        // Recupera as instâncias dos sockets
                        const p1Socket = io.sockets.sockets.get(id1);
                        const p2Socket = io.sockets.sockets.get(id2);
                        
                        if (p1Socket && p2Socket) {
                            console.log(`Iniciando Partida Específica [${roomId}]`);
                            
                            // Verifica se é Ranked pelo prefixo do ID da sala
                            const isRanked = roomId.startsWith('ranked_');
                            
                            // Instancia a partida
                            const match = new PongMatch(
                                io, 
                                roomId, 
                                p1Socket.data, 
                                p2Socket.data, 
                                isRanked
                            );
                            
                            // Registra no mapa para controle de desconexão
                            activeMatches.set(p1Socket.id, match);
                            activeMatches.set(p2Socket.id, match);
                        }
                    } else {
                        console.log(`[SOCKET] Aguardando segundo jogador...`);
                    }
                } else {
                    console.log(`[SOCKET] Erro ao entrar na sala ${roomId}`);
                }
            });
            
            // ---------------------------------------------------------
            // EVENTO 2: Fila Casual Rápida (FIFO)
            // O frontend emite isso se clicar em "Jogar Casual" direto
            // ---------------------------------------------------------
            socket.on('joinQueue', () => {
                if (waitingPlayer && waitingPlayer.id !== socket.id) {
                    console.log(`Iniciando Casual (FIFO): ${waitingPlayer.data.nick} vs ${socket.data.nick}`);
                    
                    const roomId = `casual_fifo_${waitingPlayer.id}_${socket.id}`;
                    
                    waitingPlayer.join(roomId);
                    socket.join(roomId);
                    
                    // Cria partida Casual (isRanked = false)
                    const match = new PongMatch(
                        io, 
                        roomId, 
                        waitingPlayer.data, 
                        socket.data, 
                        false 
                    );
                    
                    activeMatches.set(waitingPlayer.id, match);
                    activeMatches.set(socket.id, match);
                    
                    waitingPlayer = null;
                } else {
                    console.log('Entrou na fila casual rápida...');
                    waitingPlayer = socket;
                    socket.emit('matchStatus', 'waiting');
                }
            });
            
            // ---------------------------------------------------------
            // EVENTO 3: Desconexão
            // ---------------------------------------------------------
            socket.on('disconnect', () => {
                console.log(`[SOCKET] Cliente desconectado: ${socket.id} (User ID: ${socket.data.id})`);
                
                // Remove da fila casual se estiver lá
                if (waitingPlayer === socket) {
                    waitingPlayer = null;
                }

                // Verifica se estava em uma partida ativa
                const match = activeMatches.get(socket.id);
                if (match) {
                    // Aciona vitória por W.O.
                    match.handleDisconnection(socket.id);

                    // Limpa referências
                    activeMatches.delete(match.p1SocketId);
                    activeMatches.delete(match.p2SocketId);
                }
            });
        });

        await app.listen({ port: 3333, host: '0.0.0.0' })
        console.log('🚀 Servidor rodando em http://localhost:3333')

    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()