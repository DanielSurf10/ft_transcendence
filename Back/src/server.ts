import fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import jwt from '@fastify/jwt'

import { authRoutes } from './routes/auth.routes'
import zodValidator from './plugins/zod-validator'

dotenv.config()

const app = fastify()

app.register(cors, {
	origin: '*'
})

app.register(jwt, {
	secret: process.env.JWT_SECRET || 'JWT_SECRET'
})

app.decorate('authenticate', async function (req: any, reply: any) {
	try {
		await req.jwtVerify()
	} catch (err) {
		return (reply.code(401).send({ error: 'Token Inválido' }))
	}
})

// Rotas
app.register(zodValidator)
app.register(authRoutes, { prefix: '/auth'})

// Rodar
app.listen({ port: 3333 }).then(() => {
	console.log('🚀 Servidor rodando em http://localhost:3333')
})
