import bcrypt from 'bcrypt'
import { FastifyInstance, FastifyRequest } from 'fastify'

import {
	AnonymousInput,
	anonymousSchema,
	LoginInput,
	loginSchema,
	RegisterInput,
	registerSchema
} from '../schemas/auth.schemas'
import {
	anonymousRouteSchema,
	loginRouteSchema,
	logoutRouteSchema,
	meRouteSchema,
	registerRouteSchema
} from '../schemas/swagger/route.schemas'

interface User {
	id: number;
	name: string;
	nick: string;
	email: string;
	password?: string;
	isAnonymous: boolean;
	lastActivity?: number;
	gang: 'batatas' | 'maças'
}

const ANONYMOUS_INACTIVITY_TIMEOUT	= 5 * 60 * 1000	// 5 minutos de inatividade
const CLEANUP_INTERVAL				= 1 * 60 * 1000	// A cada 1 minuto

const	users: User[] = []
let		nextId = 1

// Schemas JSON Schema completos com exemplos
// const registerBodySchema = {
// 	type: 'object',
// 	required: ['name', 'nick', 'email', 'password', 'gang'],
// 	properties: {
// 		name: {
// 			type: 'string',
// 			minLength: 3,
// 			maxLength: 50,
// 			description: 'Nome completo do usuário',
// 			examples: ['João Silva']
// 		},
// 		nick: {
// 			type: 'string',
// 			minLength: 3,
// 			maxLength: 20,
// 			description: 'Apelido único',
// 			examples: ['joao123']
// 		},
// 		email: {
// 			type: 'string',
// 			format: 'email',
// 			description: 'Email válido',
// 			examples: ['joao@example.com']
// 		},
// 		password: {
// 			type: 'string',
// 			minLength: 8,
// 			description: 'Senha forte',
// 			examples: ['Senha@123']
// 		},
// 		gang: {
// 			type: 'string',
// 			enum: ['batatas', 'maças'],
// 			description: 'Gangue do usuário',
// 			examples: ['batatas']
// 		}
// 	}
// }
//
// const loginBodySchema = {
// 	type: 'object',
// 	required: ['identifier', 'password'],
// 	properties: {
// 		identifier: {
// 			type: 'string',
// 			minLength: 2,
// 			description: 'Email ou nick do usuário',
// 			examples: ['joao123']
// 		},
// 		password: {
// 			type: 'string',
// 			minLength: 8,
// 			description: 'Senha do usuário',
// 			examples: ['Senha@123']
// 		}
// 	}
// }
//
// const anonymousBodySchema = {
// 	type: 'object',
// 	required: ['nick'],
// 	properties: {
// 		nick: {
// 			type: 'string',
// 			minLength: 3,
// 			maxLength: 50,
// 			description: 'Apelido temporário',
// 			examples: ['visitante']
// 		}
// 	}
// }
//
// const userResponseSchema = {
// 	type: 'object',
// 	properties: {
// 		id: { type: 'number', examples: [1] },
// 		name: { type: 'string', examples: ['João Silva'] },
// 		nick: { type: 'string', examples: ['joao123'] },
// 		email: { type: 'string', examples: ['joao@example.com'] },
// 		isAnonymous: { type: 'boolean', examples: [false] },
// 		gang: { type: 'string', examples: ['batatas'] }
// 	}
// }
//
// const tokenResponseSchema = {
// 	type: 'object',
// 	properties: {
// 		token: {
// 			type: 'string',
// 			examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...']
// 		},
// 		user: userResponseSchema
// 	}
// }
//
// const errorResponseSchema = {
// 	type: 'object',
// 	properties: {
// 		error: {
// 			type: 'string',
// 			examples: ['Mensagem de erro']
// 		}
// 	}
// }
//
// const validationErrorResponseSchema = {
// 	type: 'object',
// 	properties: {
// 		error: {
// 			type: 'string',
// 			examples: ['Validação falhou']
// 		},
// 		details: {
// 			type: 'array',
// 			items: {
// 				type: 'object',
// 				properties: {
// 					field: { type: 'string', examples: ['email'] },
// 					message: { type: 'string', examples: ['Email inválido'] }
// 				}
// 			}
// 		}
// 	}
// }

function sanitize(user: User) {
	return {
		id: user.id,
		name: user.name,
		nick: user.nick,
		email: user.isAnonymous ? undefined : user.email,
		isAnonymous: user.isAnonymous,
		gang: user.gang
	}
}

function findByIdentifier(identifier: string): User | undefined {
	return (users.find(u =>
		(u.email === identifier || u.nick === identifier) && !u.isAnonymous
	))
}

function updateActivity(userId: number) {
	const user = users.find(u => u.id == userId)
	if (user && user.isAnonymous) {
		user.lastActivity = Date.now()
	}
}

function cleanupInactiveAnonymous() {
	const now = Date.now()
	const before = users.length

	const activeUsers = users.filter(user => {
		if (!user.isAnonymous)
			return (true)
		if (!user.lastActivity)
			return (false)

		const inactiveTime = now - user.lastActivity
		return (inactiveTime < ANONYMOUS_INACTIVITY_TIMEOUT)
	})

	const removed = before - activeUsers.length
	if (removed > 0) {
		users.length = 0
		users.push(...activeUsers)
	}
}

export async function authRoutes(app: FastifyInstance) {

	const cleanupTimer = setInterval(cleanupInactiveAnonymous, CLEANUP_INTERVAL)

	app.addHook('onClose', () => {
		clearInterval(cleanupTimer)
	})

	app.post('/register', {
		schema: registerRouteSchema,
		preHandler: app.validateBody(registerSchema)
	}, async (req, reply) => {
		const { name, nick, email, password, gang } = req.body as RegisterInput

		if (users.find(u => u.nick === nick)) {
			return (reply.code(400).send({ error: 'Nick já em uso' }))
		}
		if (users.find(u => u.email === email)) {
			return (reply.code(400).send({ error: 'Email já cadastrado' }))
		}

		const passwordHash: string = await bcrypt.hash(password!, 10)
		const user: User = {
			id: nextId++,
			name: name,
			nick: nick,
			email: email,
			password: passwordHash,
			isAnonymous: false,
			gang: gang
		}
		users.push(user)

		return (sanitize(user))
	})

	app.post('/login', {
		schema: loginRouteSchema,
		preHandler: app.validateBody(loginSchema)
	}, async (req, reply) => {
		const { identifier, password } = req.body as LoginInput

		const user = findByIdentifier(identifier)
		if (!user || !user.password) {
			return reply.code(401).send({ error: 'Credenciais inválidas' })
		}

		const password_pass = await bcrypt.compare(password, user.password)
		if (!password_pass) {
			return reply.code(401).send({ error: 'Credenciais inválidas' })
		}

		const token = app.jwt.sign({
			id: user.id,
			email: user.email,
			nick: user.nick,
			isAnonymous: user.isAnonymous,
			gang: user.gang
		})

		return { token, user: sanitize(user) }
	})

	app.post('/anonymous', {
		schema: anonymousRouteSchema,
		preHandler: app.validateBody(anonymousSchema)
	}, async (req, reply) => {
		const { nick } = req.body as AnonymousInput

		const generatedNick = `anonymous_${nick}`
		if (users.find(u => u.nick === generatedNick && u.isAnonymous)) {
			return reply.code(400).send({ error: 'Nick já está em uso' })
		}

		const user: User = {
			id: nextId++,
			name: generatedNick,
			nick: generatedNick,
			email: `anonymous_${nextId}@local`,
			isAnonymous: true,
			lastActivity: Date.now(),
			gang: 'batatas'
		}
		users.push(user)

		const token = app.jwt.sign({
			id: user.id,
			email: user.email,
			nick: user.nick,
			isAnonymous: true,
			gang: 'batatas'
		}, { expiresIn: '2h'})

		return ( {token, user: sanitize(user)} )
	})

	app.get('/me', {
		onRequest: [app.authenticate],
		schema: meRouteSchema
	}, async (req: FastifyRequest, reply) => {
		const user = users.find(u => u.id === req.user.id)
		if (!user) {
			return (reply.code(404).send({ error: 'Usuário não encontrado' }))
		}

		updateActivity(user.id)

		return ({ user: sanitize(user) })
	})

	app.post('/logout', {
		onRequest: [app.authenticate],
		schema: logoutRouteSchema
	}, async (req: FastifyRequest, reply) => {
		const userId = req.user.id
		const userIndex = users.findIndex(u => u.id === userId)

		if (userIndex === -1) {
			return (reply.code(404).send({ error: 'Usuário não encontrado' }))
		}

		users.splice(userIndex, 1)

		return (reply.code(200).send())
	})
}
