import {
	anonymousBodySchema,
	loginBodySchema,
	registerBodySchema
} from './request.schemas'
import {
	userResponseSchema
} from './response.schemas'

export const registerRouteSchema = {
	tags: ['auth'],
	summary: 'Registrar novo usuário',
	description: 'Cria uma nova conta de usuário permanente com gangue escolhida',
	body: registerBodySchema,
	response: {
		200: {
			description: 'Usuário criado com sucesso',
			...userResponseSchema
		},
		400: {
			description: 'Nick ou email já em uso, ou validação falhou',
			type: 'object',
			properties: {
				error: {
					type: 'string',
					examples: ['Nick já em uso', 'Email já cadastrado', 'Validação falhou']
				},
				details: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							field: { type: 'string', examples: ['email', 'password', 'nick'] },
							message: { type: 'string', examples: ['Email inválido', 'Senha deve ter ao menos uma letra maiúscula'] }
						}
					}
				}
			}
		}
	}
} as const

export const loginRouteSchema = {
	tags: ['auth'],
	summary: 'Fazer login',
	description: 'Autentica um usuário usando email ou nick. Se 2FA estiver ativado, retorna token temporário.',
	body: loginBodySchema,
	response: {
		200: {
			description: 'Login bem-sucedido ou requer 2FA',
			type: 'object',
			properties: {
				// Propriedades quando NÃO tem 2FA
				token: { type: 'string' },
				user: userResponseSchema,
				// Propriedades quando TEM 2FA
				requires2FA: { type: 'boolean' },
				tempToken: { type: 'string' },
				message: { type: 'string' }
			}
		},
		400: {
			description: 'Validação falhou',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Validação falhou'] }
			}
		},
		401: {
			description: 'Credenciais inválidas',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Credenciais inválidas'] }
			}
		},
		404: {
			description: 'Usuário não encontrado',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Credenciais inválidas'] }
			}
		}
	}
} as const

export const anonymousRouteSchema = {
	tags: ['auth'],
	summary: 'Login anônimo',
	description: 'Cria uma sessão temporária sem registro. Todos anônimos pertencem à gangue "batatas". Sessão expira em 2h ou após 5min de inatividade.',
	body: anonymousBodySchema,
	response: {
		200: {
			description: 'Sessão anônima criada com sucesso',
			type: 'object',
			properties: {
				token: {
					type: 'string',
					examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...']
				},
				user: {
					type: 'object',
					properties: {
						id: { type: 'number', examples: [2] },
						name: { type: 'string', examples: ['anonymous_visitante'] },
						nick: { type: 'string', examples: ['anonymous_visitante'] },
						isAnonymous: { type: 'boolean', examples: [true] },
						gang: { type: 'string', examples: ['batatas'] }
					}
				}
			}
		},
		400: {
			description: 'Nick já em uso ou validação falhou',
			type: 'object',
			properties: {
				error: {
					type: 'string',
					examples: ['Nick já está em uso', 'Validação falhou']
				},
				details: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							field: { type: 'string', examples: ['nick'] },
							message: { type: 'string', examples: ['Nome deve ter no mínimo 3 caracteres', 'Nick deve conter apenas letras, números e underscore'] }
						}
					}
				}
			}
		}
	}
} as const

export const meRouteSchema = {
	tags: ['auth'],
	summary: 'Obter usuário atual',
	description: 'Retorna informações do usuário autenticado. Atualiza timestamp de atividade para anônimos.',
	security: [{ bearerAuth: [] }],
	response: {
		200: {
			description: 'Informações do usuário',
			type: 'object',
			properties: {
				user: userResponseSchema
			}
		},
		401: {
			description: 'Token inválido ou expirado',
			type: 'object',
			properties: {
				error: {
					type: 'string',
					examples: ['Token Inválido']
				}
			}
		},
		404: {
			description: 'Usuário não encontrado (sessão expirada)',
			type: 'object',
			properties: {
				error: {
					type: 'string',
					examples: ['Usuário não encontrado']
				}
			}
		}
	}
} as const

export const logoutRouteSchema = {
	tags: ['auth'],
	summary: 'Fazer logout',
	description: 'Encerra a sessão do usuário. Remove permanentemente usuários anônimos.',
	security: [{ bearerAuth: [] }],
	response: {
		200: {
			description: 'Logout realizado com sucesso',
			type: 'null'
		},
		401: {
			description: 'Token inválido',
			type: 'object',
			properties: {
				error: {
					type: 'string',
					examples: ['Token Inválido']
				}
			}
		},
		404: {
			description: 'Usuário não encontrado',
			type: 'object',
			properties: {
				error: {
					type: 'string',
					examples: ['Usuário não encontrado']
				}
			}
		}
	}
} as const
