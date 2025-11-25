export const errorResponseSchema = {
	type: 'object',
	properties: {
		error: {
			type: 'string',
			examples: ['Mensagem de erro']
		}
	}
} as const

export const validationErrorResponseSchema = {
	type: 'object',
	properties: {
		error: {
			type: 'string',
			examples: ['Validação falhou']
		},
		details: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					field: { type: 'string', examples: ['email', 'password', 'nick'] },
					message: { type: 'string', examples: ['Email inválido', 'Senha muito curta'] }
				}
			}
		}
	}
} as const

export function createErrorResponse(errorMessage: string) {
	return {
		type: 'object',
		properties: {
			error: {
				type: 'string',
				examples: [errorMessage]
			}
		}
	} as const
}

export function createValidationErrorResponse(examples: Array<{field: string; message: string}>) {
	return {
		type: 'object',
		properties: {
			error: {
				type: 'string',
				examples: ['Validação falhou']
			},
			details: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						field: {
							type: 'string',
							examples: examples.map(e => e.field)
						},
						message: {
							type: 'string',
							examples: examples.map(e => e.message)
						}
					}
				}
			}
		}
	} as const
}
