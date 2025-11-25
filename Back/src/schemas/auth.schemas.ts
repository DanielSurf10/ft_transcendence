import { z } from 'zod'

export const registerSchema = z.object({
	name: z.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(50, 'Nome deve ter no máximo 50 caracteres')
		.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),

	nick: z.string()
		.min(3, 'Nick deve ter no mínimo 3 caracteres')
		.max(20, 'Nick deve ter no máximo 20 caracteres')
		.regex(/^[a-zA-Z0-9_]+$/, 'Nick deve conter apenas letras, números e underscores'),

	email: z.email('Email inválido'),

	password: z.string()
		.min(8, 'Senha deve ter no mínimo 8 caracteres')
		.regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
		.regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
		.regex(/[0-9]/, 'Senha deve conter ao menos um número')
		.regex(/[\W_]/, 'Senha deve conter ao menos um caractere especial'),

	gang: z.enum(['batatas', 'maças'], {
		message: 'Gang deve ser "batatas" ou "maças"'
	})
})

export const loginSchema = z.object({
	identifier: z.string()
		.min(2, 'Identificador deve ter no mínimo 2 caracteres'),

	password: z.string()
		.min(8, 'Senha deve ter no mínimo 8 caracteres')
})

export const anonymousSchema = z.object({
	nick: z.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(50, 'Nome deve ter no máximo 50 caracteres')
		.regex(/^[a-zA-Z0-9_]+$/, 'Nick deve conter apenas letras, números e underscore'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AnonymousInput = z.infer<typeof anonymousSchema>
