import { FastifyInstance } from 'fastify'

import { db } from '../database/memoryDB'
import { nickSchema, UpdateNickInput } from '../schemas/common.schemas'
import { updateNickRouteSchema } from '../schemas/swagger/users.schemas'
import { AuthService } from '../services/authServices'

export async function usersRoutes(app: FastifyInstance) {
	app.patch('/me', {
		onRequest: [app.authenticate],
		schema: updateNickRouteSchema,
		preHandler: app.validateBody(nickSchema)
	}, async (req, reply) => {
		const { nick } = req.body as UpdateNickInput

		const user = await db.findUserById(req.user.id)
		if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

		const existingUser = db.findUserByNick(nick)
		if (existingUser) {
			return reply.code(400).send({ error: 'Nick já em uso' })
		}

		user.nick = nick

		const token = app.jwt.sign({
			id: user.id, email: user.email, nick: user.nick,
			isAnonymous: user.isAnonymous, gang: user.gang
		})

		return reply.code(200).send({
			message: 'Nick atualizado com sucesso',
			user: AuthService.sanitizeUser(user),
			token: token
		})
	})
}
