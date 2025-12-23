import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import swaggerPlugin from './plugins/swagger'
import zodValidator from './plugins/zod-validator'
import { authRoutes, friendsRoutes, leaderboardRoutes } from './routes/auth.routes'

dotenv.config()

const app = fastify()

app.register(cors, {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
})

app.register(jwt, { secret: process.env.JWT_SECRET || 'JWT_SECRET' })
app.register(swaggerPlugin)

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
	} catch {
		return reply.code(401).send({ error: 'Token Inválido' })
	}
})

app.decorate('verifyUserExists', async function (req: FastifyRequest, reply: FastifyReply) {})

// Rotas
app.register(zodValidator)
app.register(authRoutes as any, { prefix: '/auth'})
app.register(friendsRoutes as any, { prefix: '/friends' })
app.register(leaderboardRoutes as any, { prefix: '/leaderboards' })

// Rodar
app.listen({ port: 3333 }).then(() => {
	console.log('🚀 Servidor rodando em http://localhost:3333')
})
