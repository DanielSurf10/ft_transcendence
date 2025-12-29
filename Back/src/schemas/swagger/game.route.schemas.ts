
export const rankedMatchmakingRouteSchema = {
    tags: ['Game'],
    summary: 'Entrar na fila ranqueada',
    response: {
        200: {
            type: 'object',
            properties: {
                status: { type: 'string' },
                roomId: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
};

export const inviteFriendRouteSchema = {
    tags: ['Game'],
    summary: 'Convidar amigo para jogar',
    body: {
        type: 'object',
        properties: {
            nick: { type: 'string' }
        },
        required: ['nick']
    }
};

export const respondInviteRouteSchema = {
    tags: ['Game'],
    summary: 'Responder convite de jogo',
    body: {
        type: 'object',
        properties: {
            nick: { type: 'string' },
            action: { type: 'string', enum: ['accept', 'decline'] }
        },
        required: ['nick', 'action']
    }
};