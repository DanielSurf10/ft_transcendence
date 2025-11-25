export const userResponseSchema = {
	type: 'object',
	properties: {
		id: { type: 'number', examples: [1] },
		name: { type: 'string', examples: ['João Silva'] },
		nick: { type: 'string', examples: ['joao123'] },
		email: { type: 'string', examples: ['joao@example.com'] },
		isAnonymous: { type: 'boolean', examples: [false] },
		gang: { type: 'string', examples: ['batatas'] }
	}
} as const

export const tokenResponseSchema = {
	type: 'object',
	properties: {
		token: {
			type: 'string',
			examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...']
		},
		user: userResponseSchema
	}
} as const

export const messageResponseSchema = {
	type: 'object',
	properties: {
		message: {
			type: 'string',
			examples: ['Operação realizada com sucesso']
		}
	}
} as const
