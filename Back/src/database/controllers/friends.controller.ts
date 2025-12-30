import { Friends, Invites } from '@prisma/client'

import { prisma } from '../prisma'


export class FriendsController {
	static async addFriend(player1Id: number, player2Id: number): Promise<Friends> {
		const [smallerId, largerId] = player1Id < player2Id
			? [player1Id, player2Id]
			: [player2Id, player1Id]

		return await prisma.friends.create({
			data: {
				idPlayer1: smallerId,
				idPlayer2: largerId
			}
		})
	}

	static async removeFriend(player1Id: number, player2Id: number): Promise<void> {
		const [smallerId, largerId] = player1Id < player2Id
			? [player1Id, player2Id]
			: [player2Id, player1Id]

		await prisma.friends.deleteMany({
			where: {
				OR: [
					{ idPlayer1: smallerId, idPlayer2: largerId },
					{ idPlayer1: largerId, idPlayer2: smallerId }
				]
			}
		})
	}

	static async areFriends(player1Id: number, player2Id: number): Promise<boolean> {
		const friendship = await prisma.friends.findFirst({
			where: {
				OR: [
					{ idPlayer1: player1Id, idPlayer2: player2Id },
					{ idPlayer1: player2Id, idPlayer2: player1Id }
				]
			}
		})

		return !!friendship
	}

	static async getFriends(playerId: number) {
		const friendships = await prisma.friends.findMany({
			where: {
				OR: [
					{ idPlayer1: playerId },
					{ idPlayer2: playerId }
				]
			},
			include: {
				player1: true,
				player2: true
			}
		})

		return friendships.map(f =>
			f.idPlayer1 == playerId ? f.player2 : f.player1
		)
	}

	static async sendInvite(senderId: number, receiverId: number): Promise<Invites> {
		return await prisma.invites.create({
			data: {
				idSender: senderId,
				idRec: receiverId
			}
		})
	}

	static async inviteExists(senderId: number, receiverId: number): Promise<boolean> {
		const invite = await prisma.invites.findFirst({
			where: {
				idSender: senderId,
				idRec: receiverId
			}
		})

		return !!invite
	}

	static async removeInvite(senderId: number, receiverId: number): Promise<void> {
		await prisma.invites.deleteMany({
			where: {
				idSender: senderId,
				idRec: receiverId
			}
		})
	}

	static async getReceivedInvites(playerId: number) {
		const invites = await prisma.invites.findMany({
			where: { idRec: playerId },
			include: {
				sender: true
			}
		})

		return invites.map(inv => inv.sender)
	}

	static async getSentInvites(playerId: number) {
		const invites = await prisma.invites.findMany({
			where: { idSender: playerId },
			include: {
				receiver: true
			}
		})

		return invites.map(inv => inv.receiver)
	}

	static async acceptInvite(senderId: number, receiverId: number): Promise<void> {
		await prisma.$transaction(async (tx) => {
			await tx.invites.deleteMany({
				where: {
					idSender: senderId,
					idRec: receiverId
				}
			})

			const [smallerId, largerId] = senderId < receiverId
				? [senderId, receiverId]
				: [receiverId, senderId]

			await tx.friends.create({
				data: {
					idPlayer1: smallerId,
					idPlayer2: largerId
				}
			})
		})
	}

	static async declineInvites(senderId: number, receiverId: number): Promise<void> {
		await this.removeInvite(senderId, receiverId)
	}
}
