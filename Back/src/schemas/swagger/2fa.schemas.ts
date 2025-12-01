export const setup2FARouteSchema = {
	tags: ['auth'],
	summary: 'Configurar 2FA',
	description: 'Gera um secret e QR code para configuração do 2FA',
	security: [{ bearerAuth: [] }],
	response: {
		200: {
			description: 'Secret e QR code gerados',
			type: 'object',
			properties: {
				secret: { type: 'string', examples: ['JBSWY3DPEHPK3PXP'] },
				qrcode: { type: 'string', examples: ['data:image/png;base64,iVBORw0KGgo...'] }
			}
		},
		400: {
			description: 'Erro ao gerar secret ou QR code',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Erro ao gerar QR code'] }
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
			description: 'User not found',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const

export const enable2FARouteSchema = {
	tags: ['auth'],
	summary: 'Ativar 2FA',
	description: 'Valida o token TOTP e ativa o 2FA, retornando backup codes',
	security: [{ bearerAuth: [] }],
	body: {
		type: 'object',
		required: ['token', 'secret'],
		properties: {
			token: { type: 'string', examples: ['123456'] },
			secret: { type: 'string', examples: ['JBSWY3DPEHPK3PXP'] }
		}
	},
	response: {
		200: {
			description: '2FA ativado com sucesso',
			type: 'object',
			properties: {
				message: { type: 'string', examples: ['2FA ativado com sucesso'] },
				backupCodes: {
					type: 'array',
					items: { type: 'string' },
					examples: [['ABCD-1234', 'EFGH-5678']]
				}
			}
		},
		400: {
			description: 'Token inválido ou validação falhou',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Token inválido', 'Validação falhou'] }
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
			description: 'User not found',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Usuário não encontrado'] }
			}
		}
	}
} as const

export const disable2FARouteSchema = {
	tags: ['auth'],
	summary: 'Desativar 2FA',
	description: 'Valida o token TOTP e desativa o 2FA',
	security: [{ bearerAuth: [] }],
	body: {
		type: 'object',
		required: ['token'],
		properties: {
			token: { type: 'string', examples: ['123456'] }
		}
	},
	response: {
		200: {
			description: '2FA desativado com sucesso',
			type: 'object',
			properties: {
				message: { type: 'string', examples: ['2FA desativado com sucesso'] }
			}
		},
		400: {
			description: 'Token inválido ou 2FA não está ativado',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Token inválido', '2FA não está ativado'] }
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
			description: 'User not found',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Usuário não encontrado'] }
			}
		}
	}
} as const

export const login2FARouteSchema = {
	tags: ['auth'],
	summary: 'Completar login com 2FA',
	description: 'Valida o token TOTP e retorna o JWT completo',
	security: [{ bearerAuth: [] }],
	body: {
		type: 'object',
		required: ['token'],
		properties: {
			token: { type: 'string', examples: ['123456'] }
		}
	},
	response: {
		200: {
			description: 'Login 2FA bem-sucedido',
			type: 'object',
			properties: {
				token: { type: 'string', examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'] },
				user: {
					type: 'object',
					properties: {
						id: { type: 'number', examples: [1] },
						name: { type: 'string', examples: ['João Silva'] },
						nick: { type: 'string', examples: ['joao123'] },
						email: { type: 'string', examples: ['joao@example.com'] },
						gang: { type: 'string', examples: ['batatas'] }
					}
				}
			}
		},
		400: {
			description: 'Token inválido',
			type: 'object',
			properties: {
				error: { type: 'string', examples: ['Token inválido'] }
			}
		},
		401: {
			description: 'Token JWT temporário inválido',
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
