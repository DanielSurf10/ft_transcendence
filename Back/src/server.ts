import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { Server, Socket } from 'socket.io' // <--- 1. Importações do Socket.IO
import { PongMatch } from './game/PongMatch';

import swaggerPlugin from './plugins/swagger'
import zodValidator from './plugins/zod-validator'
import { authRoutes, friendsRoutes, leaderboardRoutes } from './routes/auth.routes'

dotenv.config()

const app = fastify()

// Variável global para fila de espera
let waitingPlayer: Socket | null = null; // <--- Tipagem correta aqui também

// Configuração do CORS do Fastify (HTTP)
app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})

app.register(jwt, { secret: process.env.JWT_SECRET || 'JWT_SECRET' })
app.register(swaggerPlugin)

// ... Seus decorators (authenticate, authenticate2FA, etc) ...
app.decorate('authenticate', async function (req: FastifyRequest, reply: FastifyReply) {
    try {
        await req.jwtVerify()
        if (req.user.temp2FA) {
            return reply.code(401).send({ error: 'Token temporário não é válido para esta ação' })
        }
    } catch {
        return (reply.code(401).send({ error: 'Token Inválido' }))
    }
})

app.decorate('authenticate2FA', async function (req: FastifyRequest, reply: FastifyReply) {
    try {
        await req.jwtVerify()
        if (!req.user.temp2FA) {
            return reply.code(401).send({ error: 'Token temporário inválido' })
        }
    } catch (err) {
        console.log("Erro no jwtVerify:", err); 
        return reply.code(401).send({ error: 'Token Inválido' })
    }
})

app.decorate('verifyUserExists', async function (req: FastifyRequest, reply: FastifyReply) {})

// Rotas HTTP
app.register(zodValidator)
app.register(authRoutes as any, { prefix: '/auth'})
app.register(friendsRoutes as any, { prefix: '/friends' })
app.register(leaderboardRoutes as any, { prefix: '/leaderboards' })

// --- INICIALIZAÇÃO DO SERVIDOR E SOCKET.IO ---

const start = async () => {
    try {
        // 1. Espera o Fastify carregar plugins e criar o servidor HTTP interno
        await app.ready();

        // 2. Inicializa o Socket.IO atrelado ao servidor HTTP do Fastify
        const io = new Server(app.server, {
            cors: {
                origin: "*", // Permite conexões do Front (Vite roda em outra porta)
                methods: ["GET", "POST"]
            }
        });

        // 3. Lógica do Socket (Agora 'io' existe)
        io.on('connection', (socket: Socket) => { // <--- Tipagem adicionada: Socket
            console.log('Cliente conectado no Socket:', socket.id);

            // Lógica de Matchmaking "FIFO"
            if (waitingPlayer && waitingPlayer.id !== socket.id) {
                console.log(`Iniciando partida: ${waitingPlayer.id} vs ${socket.id}`);
                
                // Instancia o jogo
                new PongMatch(io, waitingPlayer.id, socket.id);
                
                waitingPlayer = null; 
            } else {
                console.log('Jogador aguardando oponente...');
                waitingPlayer = socket;
                socket.emit('matchStatus', 'waiting');
            }

            // Lidar com desconexão durante a espera
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
                if (waitingPlayer === socket) {
                    waitingPlayer = null;
                }
            });
        });

        // 4. Rodar o servidor na porta
        await app.listen({ port: 3333, host: '0.0.0.0' });
        console.log('🚀 Servidor rodando em http://localhost:3333');

    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();