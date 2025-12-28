import { api } from "./api";

interface UpdateNickPayload {
	nick: string;
}

interface UpdateNickResponse {
	message: string;
	user: {
		id: number;
		name: string;
		nick: string;
		email: string;
		isAnonymous: boolean;
		gang: 'potatoes' | 'tomatoes';
		has2FA: boolean;
	};
	token: string;
}

export const profileService = {
	updateProfile: (data: UpdateNickPayload): Promise<UpdateNickResponse> =>
		api.request<UpdateNickResponse>("/users/me", {
			method: "PATCH",
			body: data
		}),
};
