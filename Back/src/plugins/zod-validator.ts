import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { ZodError, ZodType } from 'zod'

declare module 'fastify' {
	interface FastifyInstance {
		validateBody: <T>(schema: ZodType<T>) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
		validateParams: <T>(schema: ZodType<T>) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
	}
}

const zodValidatorPlugin: FastifyPluginAsync = async (fastify) => {
	fastify.decorate('validateBody', <T>(schema: ZodType<T>) => {
		return async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				request.body = schema.parse(request.body)
			} catch (error) {
				if (error instanceof ZodError) {
					return reply.code(400).send({
						error: 'Validação falhou',
						details: error.issues.map(err => ({
							field: err.path.join('.'),
							message: err.message
						}))
					})
				}
				throw error
			}
		}
	})

	fastify.decorate('validateParams', <T>(schema: ZodType<T>) => {
		return async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				request.params = schema.parse(request.params)
			} catch (error) {
				if (error instanceof ZodError) {
					return reply.code(400).send({
						error: 'Validação falhou',
						details: error.issues.map(err => ({
							field: err.path.join('.'),
							message: err.message
						}))
					})
				}
				throw error
			}
		}
	})
}

export default fp(zodValidatorPlugin)
