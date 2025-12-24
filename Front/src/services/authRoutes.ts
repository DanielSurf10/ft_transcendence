import { api } from "./api";

interface RegisterPayload {
	name: string;
	nick: string;
	email: string;
	password: string;
	gang: 'potatoes' | 'tomatoes';
}

interface LoginPayload {
	identifier: string;
	password: string;
}

interface Login2FAPayload {
	token: string;
}

interface Enable2FAPayload {
	token: string;
	secret: string;
}

interface Disable2FAPayload {
	token: string;
}

interface AnonymousPayload {
	nick: string;
}

interface UserResponse {
	id: number;
	name: string;
	nick: string;
	email?: string;
	isAnonymous: boolean;
	gang: 'potatoes' | 'tomatoes';
	has2FA: boolean;
}

interface LoginResponse {
	token: string;
	user: UserResponse;
	requires2FA?: boolean;
	tempToken?: string;
}

interface RegisterResponse {
	id: number;
	name: string;
	nick: string;
	email: string;
	isAnonymous: boolean;
	gang: 'potatoes' | 'tomatoes';
}

interface AnonymousResponse {
	token: string;
	user: UserResponse;
}

interface Setup2FAResponse {
	secret: string;
	qrcode: string;
}

interface Enable2FAResponse {
	message: string;
	backupCodes: string[];
}

interface Disable2FAResponse {
	message: string;
}

interface LogoutResponse {
	message?: string;
}

export const authService = {
	register: (data: RegisterPayload): Promise<RegisterResponse> =>
		api.post<RegisterResponse>("/auth/register", data),

	login: (data: LoginPayload): Promise<LoginResponse> =>
		api.post<LoginResponse>("/auth/login", data),

	login2FA: (data: Login2FAPayload): Promise<LoginResponse> => {
        // 1. Pegamos o token temporário explicitamente
        const tempToken = localStorage.getItem('tempToken');
        
        // 2. Passamos ele no terceiro argumento (options) que criamos no api.ts
        return api.post<LoginResponse>("/auth/login/2fa", data, {
            headers: {
                // Isso vai sobrescrever a lógica padrão e usar o tempToken
                Authorization: `Bearer ${tempToken}` 
            }
        });
    },

	createAnonymous: (data: AnonymousPayload): Promise<AnonymousResponse> =>
		api.post<AnonymousResponse>("/auth/anonymous", data),

	getProfile: (): Promise<{ user: UserResponse }> =>
		api.get<{ user: UserResponse }>("/auth/me"),

	setup2FA: (): Promise<Setup2FAResponse> =>
		api.post<Setup2FAResponse>("/auth/2fa/setup", {}),

	enable2FA: (data: Enable2FAPayload): Promise<Enable2FAResponse> =>
		api.post<Enable2FAResponse>("/auth/2fa/enable", data),

	disable2FA: (data: Disable2FAPayload): Promise<Disable2FAResponse> =>
		api.post<Disable2FAResponse>("/auth/2fa/disable", data),

	logout: (): Promise<LogoutResponse> =>
		api.post<LogoutResponse>("/auth/logout", {}),
};
