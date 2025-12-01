import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: {
			id: number;
			email: string;
			nick: string;
			isAnonymous: boolean;
			gang: string
			temp2FA?: boolean
		}
		user: {
			id: number;
			email: string;
			nick: string;
			isAnonymous: boolean;
			gang: string
			temp2FA?: boolean
		}
	}
}

declare module 'fastify' {
	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
		authenticate2FA: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
		updateLastActivity: (req: FastifyRequest) => void;
		validateBody: <T>(schema: ZodType<T>) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
	}
}
