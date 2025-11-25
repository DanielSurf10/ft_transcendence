import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

async function swaggerPlugin(app: FastifyInstance) {
	// if (process.env.NODE_ENV === 'production') {
	// 	return
	// }

	await app.register(swagger, {
		openapi: {
			info: {
				title: 'ft_transcendence API',
				description: 'API para autenticação e gerenciamento de usuários',
				version: '1.0.0'
			},
			servers: [
				{
					url: 'http://localhost:3333',
					description: 'Servidor de Desenvolvimento'
				}
			],
			tags: [
				{ name: 'auth', description: 'Endpoints de autenticação' }
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT'
					}
				}
			}
		}
	})

	await app.register(swaggerUi, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'list',
			deepLinking: true
		}
	})

	console.log('📚 Swagger habilitado em /docs')
}

export default fp(swaggerPlugin)
