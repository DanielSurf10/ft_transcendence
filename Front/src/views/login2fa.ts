import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { authService } from "../services/authRoutes";
import { showModal } from "../utils/modalManager";
import { state, saveState, type Route } from "../store/appState";

// --- HTML ---
export function getLogin2FAHtml() {
	// Tenta pegar a gangue do state (definido parcialmente no primeiro passo do login)
	// Se não tiver, usa potatoes como fallback
	const user = state.user;
	const gang = user?.gang || 'potatoes';
	const isPotato = gang === 'potatoes';

	// const titleColor = isPotato ? 'text-yellow-400' : 'text-red-400';
	const titleColor = 'text-white';
	const titleGlow = isPotato
		? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]'
		: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]';

	const cardShadow = 'shadow-[0_0_20px_rgba(234,179,8,0.15)]'

	return `
		<img
			src="src/assets/bg-login.png"
			class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
		/>

		<div class="min-h-screen flex justify-center items-center p-5">

			${Card({
				className: `
					max-w-md w-full text-center
					bg-slate-900/60 backdrop-blur-md
					border border-white/10
					${cardShadow}
				`,
				children: `
					<div class="mb-6">
						<span class="text-4xl mb-2 block">🔐</span>
						<h2 class="${titleColor} ${titleGlow} text-3xl font-bold">
							Autenticação 2FA
						</h2>
					</div>

					<p class="text-gray-300 text-sm mb-8">
						Sua conta está protegida. Digite o código de 6 dígitos do seu aplicativo autenticador.
					</p>

					<div class="mb-8">
						${Input({
							id: "input-login-2fa-code",
							placeholder: "2FA CODE",
							className: `
								text-center text-3xl tracking-[0.5em] font-mono
								bg-slate-800/80 border border-white/10
								focus:border-cyan-500
								focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]
								py-4 text-white
							`,
							type: "text",
						})}
					</div>

					${Button({
						id: "btn-login-2fa-confirm",
						text: "Verificar e Entrar",
						variant: "primary",
						className: "w-full py-3 text-lg"
					})}

					${Button({
						id: "btn-login-2fa-cancel",
						text: "Voltar",
						variant: "ghost",
						className: "mt-4 text-sm text-gray-400 hover:text-white"
					})}
				`
			})}
		</div>
	`;
}

// --- LÓGICA ---
export function setupLogin2FAEvents(navigate: (route: Route) => void) {

	// Botão Voltar/Cancelar
	document.getElementById('btn-login-2fa-cancel')?.addEventListener('click', () => {
		localStorage.removeItem('tempToken');
		state.user = null; // Limpa o user temporário
		navigate('login');
	});

	// Botão Confirmar
	document.getElementById('btn-login-2fa-confirm')?.addEventListener('click', async () => {
		const tokenInput = document.getElementById('input-login-2fa-code') as HTMLInputElement;
		const code = tokenInput.value;

		const tempToken = localStorage.getItem('tempToken');

		// Se perdeu o token temporário (F5 na página), volta pro login
		if (!tempToken) {
			navigate('login');
			return;
		}

		try {
			const response = await authService.login2FA({
				token: code,
			});

			// Sucesso: Persiste token real e limpa temporário
			localStorage.setItem('token', response.token);
			localStorage.removeItem('tempToken');

			state.isAuthenticated = true;
			state.user = {
				id: response.user.id,
				name: response.user.name,
				nick: response.user.nick,
				gang: response.user.gang,
				isAnonymous: response.user.isAnonymous,
				isOnline: true,
				score: 0,
				rank: 0,
				has2FA: true
			};

			saveState(); // Salva no localStorage
			navigate('dashboard');

		} catch (error: any) {
			showModal({
				title: "Acesso Negado",
				message: error.message || "Código incorreto ou expirado.",
				type: "danger",
				confirmText: "Tentar novamente"
			});
			tokenInput.value = "";
			tokenInput.focus();
		}
	});
}
