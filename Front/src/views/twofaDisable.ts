import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { authService } from "../services/authRoutes";
import { showModal } from "../utils/modalManager";
import { state, saveState, type Route } from "../store/appState";

//imgs
import bgPotatoes from '../assets/bg-login-potatoes.png';
import bgTomatoes from '../assets/bg-login-tomatoes.png';

const backgroundByGang = {
	potatoes: bgPotatoes,
	tomatoes: bgTomatoes,
};

// --- HTML ---
export function get2FADisableHtml() {
	const user = state.user;
	const gang = user?.gang || "potatoes";
	const backgroundImage = backgroundByGang[gang];

	// Estilos dinâmicos baseados na gangue (opcional, para consistência)
	const cardBorder = gang === 'potatoes' ? 'border-yellow-500/30' : 'border-red-500/30';
	const cardShadow = gang === 'potatoes' ? 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.15)]';

	return `
		<img src="${backgroundImage}" class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30" />

		<div class="min-h-screen flex justify-center items-center p-5">
			${Card({
				className: `max-w-md w-full text-center bg-slate-900/40 backdrop-blur-md border ${cardBorder} ${cardShadow}`,
				children: `
					<h2 class="text-red-500 mb-4 text-3xl font-bold drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
						Desativar 2FA
					</h2>

					<p class="text-gray-300 text-md mb-6">
						Para continuar, informe o Token de 6 dígitos do seu autenticador.
					</p>

					<div class="mb-6">
						${Input({
							id: "input-2fa-disable-token",
							placeholder: "000 000",
							className: `
								text-center text-3xl tracking-[0.5em] font-mono
								bg-slate-800/80 border border-white/10
								focus:border-red-500
								focus:shadow-[0_0_10px_rgba(239,68,68,0.4)]
								py-4 text-white
							`,
							type: "text" // ou number
						})}
					</div>

					${Button({
						id: "btn-2fa-disable-confirm",
						text: "Confirmar Desativação",
						variant: "danger",
						className: "w-full py-3"
					})}

					${Button({
						id: "btn-2fa-disable-cancel",
						text: "Cancelar",
						variant: "ghost",
						className: "mt-4 text-sm w-full"
					})}
				`
			})}
		</div>
	`;
}

// --- LÓGICA ---
export function setup2FADisableEvents(navigate: (route: Route) => void) {
	const confirmBtn = document.getElementById("btn-2fa-disable-confirm") as HTMLButtonElement;
	const cancelBtn = document.getElementById("btn-2fa-disable-cancel") as HTMLButtonElement;

	// Ação Confirmar
	confirmBtn?.addEventListener("click", async () => {
		const input = document.getElementById("input-2fa-disable-token") as HTMLInputElement;
		// Remove espaços em branco caso o usuário digite "123 456"
		const tokenValue = input?.value.replace(/\s/g, '');

		if (!tokenValue || tokenValue.length !== 6) {
			showModal({
				title: "Código inválido",
				message: "Informe o código de 6 dígitos do autenticador.",
				type: "danger"
			});
			return;
		}

		try {
			const response = await authService.disable2FA({
				token: tokenValue,
			});

			if (response.message === '2FA desabilitado com sucesso') {
				if (state.user) {
					state.user.has2FA = false;
					saveState(); // IMPORTANTE: Salva no localStorage para persistir F5
				}

				showModal({
					title: "Sucesso",
					message: "A autenticação em duas etapas foi desativada.",
					type: "success",
					confirmText: "OK",
					onConfirm: () => navigate("settings")
				});
			}
		} catch (error: any) {
			showModal({
				title: "Falha ao desativar",
				message: error.message || "Não foi possível validar o código.",
				type: "danger",
				confirmText: "Tentar novamente",
			});
			input.value = "";
			input.focus();
		}
	});

	// Ação Cancelar
	cancelBtn?.addEventListener("click", () => {
		navigate("settings");
	});
}
