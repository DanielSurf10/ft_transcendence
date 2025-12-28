export const updateNickRouteSchema = {
	tags: ['users'],
	summary: 'Atualizar nick do usuário',
	description: 'Atualiza o nickname do usuário autenticado',
	security: [{ bearerAuth: [] }],
	body: {
		type: 'object',
		required: ['nick'],
		properties: {
			nick: {
				type: 'string',
				description: 'Novo nickname do usuário',
				examples: ['joao123', 'player_pro']
			}
		}
	},
	response: {
		200: {
			description: 'Nick atualizado com sucesso',
			type: 'object',
			properties: {
				message: { type: 'string', examples: ['Nick atualizado com sucesso'] },
				user: {
					type: 'object',
					properties: {
						id: { type: 'number', examples: [1] },
						name: { type: 'string', examples: ['João Silva'] },
						nick: { type: 'string', examples: ['joao123'] },
						email: { type: 'string', examples: ['joao@example.com'] },
						isAnonymous: { type: 'boolean', examples: [false] },
						gang: { type: 'string', examples: ['potatoes'] },
						has2FA: { type: 'boolean', examples: [false] }
					}
				},
				token: { type: 'string', examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'] }
			}
		},
		400: {
			description: 'Nick já em uso ou validação falhou',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Nick já em uso', 'Validação falhou'] },
				details: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							field: { type: 'string', examples: ['nick'] },
							message: { type: 'string', examples: ['Nick deve ter no mínimo 3 caracteres'] }
						}
					}
				}
			}
		},
		401: {
			description: 'Não autorizado',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Token Inválido'] }
			}
		},
		404: {
			description: 'Usuário não encontrado',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Usuário não encontrado'] }
			}
		}
	}
} as const
