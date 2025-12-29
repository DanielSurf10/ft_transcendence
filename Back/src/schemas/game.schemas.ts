import { z } from 'zod';

export const GameInviteSchema = z.object({
    nick: z.string().min(1, 'Nick do convidado é obrigatório'),
});

export type GameInviteInput = z.infer<typeof GameInviteSchema>;

export const GameResponseSchema = z.object({
    nick: z.string().min(1, 'Nick de quem convidou é obrigatório'),
    action: z.enum(['accept', 'decline'] as const, {
        message: "Ação deve ser 'accept' ou 'decline'"
    }),
});

export type GameResponseInput = z.infer<typeof GameResponseSchema>;