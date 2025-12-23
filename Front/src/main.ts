import './style.css';
import { showModal } from './utils/modalManager';
import { getDashboardHtml } from './views/dashboard';
import { getFriendsHtml } from './views/friends';
import { getRankingHtml } from './views/ranking';

import { authService } from './services/authRoutes';
import { friendsService } from './services/friendsRoutes';
import { getLoginHtml } from './views/login';
import { getProfileHtml } from './views/profile';
import { getRegisterHtml, updateRegisterBg } from './views/register';

type Route = 'login' | 'register' | '2fa' | 'dashboard' | 'game' | 'profile' | 'friends' | 'leaderboard';

export interface User {
	id: number;
	name: string;
	nick: string;
	avatar?: string;
	isAnonymous: boolean;
	score: number;
	rank: number;
	isOnline: boolean;
	gang: 'potatoes' | 'tomatoes'
}

interface State {
	user: User | null;
	isAuthenticated: boolean;
}

const savedState = localStorage.getItem('appState');

export const state: State = {
	user: savedState ? JSON.parse(savedState).user : null,
	isAuthenticated: savedState ? true : false,
}

const app = document.querySelector<HTMLDivElement>('#app')!;

function navigateTo(route: Route, addToHistory = true) {
	if (route === 'dashboard' || route === 'profile' || route == 'game') {
		if (!state.isAuthenticated) {
			navigateTo('login');
			return ;
		}
	}

	// if (route === 'login' || route === 'register' || route === '2fa') {
	// 	if (state.isAuthenticated) {
	// 		navigateTo('dashboard', false);
	// 		return ;
	// 	}
	// }

	if (addToHistory) {
		history.pushState({ route }, '', `#${route}`);
	}

	// window.location.pathname = "";
	window.location.hash = `#${route}`;

	renderView(route);
}

async function renderView(route: Route) {
	switch (route) {
		case 'login':
			if (state.isAuthenticated) {
				navigateTo('dashboard', false);
				return;
			}

			app.innerHTML = getLoginHtml();
			setupLoginEvents();
			break;

		case 'register':
			if (state.isAuthenticated) {
				navigateTo('dashboard', false);
				return;
			}
			app.innerHTML = getRegisterHtml();
			setupRegisterEvents();
			break;

// 		case '2fa':
// 			app.innerHTML = get2faHtml();
// 			setup2faEvents();
// 			break;

		case 'dashboard':
			app.innerHTML = getDashboardHtml();
			setupDashboardEvents();
			break;

// 		case 'game':
// 			app.innerHTML = getGameHtml();
// 			setupGameEvents();
// 			break;

		case 'profile':
			if (state.user && state.user.isAnonymous) {
				navigateTo("dashboard", false);
				showModal({
					title: "Acesso Negado",
					message: "Usuários anônimos não podem acessar o perfil. Por favor, crie uma conta para personalizar seu perfil.",
					type: "danger",
					confirmText: "Voltar ao Menu"
				});
				return;
			}

			app.innerHTML = getProfileHtml();
			setupProfileEvents();
			break;

		case 'friends':
			if (state.user && state.user.isAnonymous) {
				navigateTo("dashboard", false);
				showModal({
					title: "Acesso Negado",
					message: "Usuários anônimos não podem ter amigos. Por favor, crie uma conta para ser socializar.",
					type: "danger",
					confirmText: "Voltar ao Menu"
				});
				return;
			}

			app.innerHTML = await getFriendsHtml()
			await setupFriendsEvents();

			break;

		case 'leaderboard':
			if (state.user && state.user.isAnonymous) {
				navigateTo("dashboard", false);
				showModal({
					title: "Acesso Negado",
					message: "Usuários anônimos não podem acessar o leaderboard. Por favor, crie uma conta para acessar.",
					type: "danger",
					confirmText: "Voltar ao Menu"
				});
				return;
			}
			app.innerHTML = getRankingHtml();
			setupRankingEvents();

			break;

		default:
			navigateTo('login');
	}
}

window.addEventListener('popstate', (event) => {
	const routeState = event.state;

	if (routeState && routeState.route) {
		navigateTo(event.state.route, false);
	} else {
		const path = window.location.pathname.replace('/', '').replace('#', '') as Route;
		navigateTo(path || 'login', false)
	}
});

window.addEventListener('hashchange', () => {
	const path = window.location.hash.replace('#', '') as Route;
	console.log(path)
	navigateTo(path, false);
});

function setupLoginEvents() {
	document.getElementById('btn-login-user')?.addEventListener('click', async () => {
		const userInput = (document.getElementById('input-login-user') as HTMLInputElement).value;
		const passInput = (document.getElementById('input-login-pass') as HTMLInputElement).value;

		if (userInput && passInput) {
			try {
				const response = await authService.login({
					identifier: userInput,
					password: passInput
				});

				localStorage.setItem('token', response.token);

				state.isAuthenticated = true;
				state.user = {
					id: response.user.id,
					name: response.user.name,
					nick: response.user.nick,
					gang: response.user.gang,
					isAnonymous: response.user.isAnonymous,
					// isOnline: response.user.isOnline,
					// score: response.user.score,
					// rank: response.user.rank
					// Puxar dados do back end
					isOnline: true,
					score: 0,
					rank: 0
				};

				localStorage.setItem('appState', JSON.stringify(state));
				navigateTo('dashboard');

			} catch (error) {
				showModal({
					title: "Erro no login",
					message: "Não foi possível realizar o login. Por favor, verifique suas credenciais e tente novamente.",
					type: "danger",
					confirmText: "Tentar novamente"
				});
			}
		}
	})

	document.getElementById('btn-login-guest')?.addEventListener('click', async () => {
		const userAnonymous = (document.getElementById('input-login-guest') as HTMLInputElement).value;

		if (userAnonymous) {
			try {
				const response = await authService.createAnonymous({
					nick: userAnonymous
				});

				localStorage.setItem('token', response.token);
				console.log(response.user);

				state.isAuthenticated = true;
				state.user = {
					id: response.user.id,
					name: response.user.name,
					nick: response.user.nick,
					gang: response.user.gang,
					isAnonymous: response.user.isAnonymous,
					// isOnline: response.user.isOnline,
					// score: response.user.score,
					// rank: response.user.rank
					// Puxar dados do back end
					isOnline: true,
					score: 0,
					rank: 0
				};
				localStorage.setItem('appState', JSON.stringify(state));
				navigateTo('dashboard');

			} catch (error) {
				// Tratar erro
			}

		}
	})

	document.getElementById('btn-register')?.addEventListener('click', () => {
		navigateTo('register');
	})
}

export function setupRegisterEvents() {
	document.getElementById('btn-register-back')?.addEventListener('click', () => {
		navigateTo('login');
	})

	document.getElementById('btn-register-submit')?.addEventListener('click', async () => {
		const name = (document.getElementById('input-register-name') as HTMLInputElement).value;
		const nick = (document.getElementById('input-register-nick') as HTMLInputElement).value;
		const email = (document.getElementById('input-register-email') as HTMLInputElement).value;
		const pass = (document.getElementById('input-register-pass') as HTMLInputElement).value;
		const gang = (document.getElementById('select-register-gang') as HTMLSelectElement).value as 'potatoes' | 'tomatoes';

		if (name && nick && email && pass && gang) {
			try {
				await authService.register({
					name,
					nick,
					email,
					password: pass,
					gang
				});

				showModal({
					title: "Bem-vindo!",
					message: `A conta de ${name} foi criada com sucesso. Prepare-se para a batalha!`,
					type: "success",
					confirmText: "Ir para Login",
					onConfirm: () => {
						navigateTo('login');
					}
				});

			} catch (error) {
				showModal({
					title: "Erro no cadastro",
					message: "Não foi possível criar a conta. Por favor, verifique os dados e tente novamente.",
					type: "danger",
					confirmText: "Tentar novamente"
				});
			}

		} else {
			showModal({
				title: "Erro no cadastro",
				message: "Por favor, preencha todos os campos para criar sua conta.",
				type: "danger",
				confirmText: "Tentar novamente"
			});
		}
	})

	document.getElementById('select-register-gang')?.addEventListener('change', updateRegisterBg);
}

function setup2faEvents() {

}

function setupDashboardEvents() {
	document.getElementById('btn-dashboard-logout')?.addEventListener('click', () => {
		showModal({
			title: "Sair",
			message: "Tem certeza que deseja abandonar a arena? Seu progresso não salvo será perdido.",
			type: "danger",
			confirmText: "Sim, Sair",
			cancelText: "Cancelar",
			onConfirm: async () => {

				if (state.user && state.user.isAnonymous) {
					try {
						await authService.logout();
					} catch (error) {
						// Tratar erro
					}
				}

				state.user = null;
				state.isAuthenticated = false;
				localStorage.removeItem('appState');
				localStorage.removeItem('token');
				navigateTo('login');
			}
		});
	})

	document.getElementById('btn-dashboard-profile')?.addEventListener('click', () => {
		navigateTo('profile');
	})

	document.getElementById('btn-dashboard-friends')?.addEventListener('click', () => {
		navigateTo('friends');
	})

		document.getElementById('btn-dashboard-leaderboard')?.addEventListener('click', () => {
		navigateTo('leaderboard');
	})
}

function setupGameEvents() {

}

function setupProfileEvents() {
	document.getElementById('btn-profile-back')?.addEventListener('click', () => {
		navigateTo('dashboard');
	})

	document.getElementById('btn-profile-save')?.addEventListener('click', async () => {
		const name = (document.getElementById('input-profile-name') as HTMLInputElement).value;

		if (name) {
			showModal({
				title: "Perfil Atualizado",
				message: `Seu nome de exibição foi alterado para ${name}. Continue dominando a arena!`,
				type: "success",
				confirmText: "Voltar ao Menu",
				onConfirm: () => {
					state.user!.name = name;
					localStorage.setItem('appState', JSON.stringify(state));
					navigateTo('dashboard');
				}
			});
		}
	})
}

function setupFriendsEvents() {
	document.getElementById('btn-friends-back')?.addEventListener('click', () => {
		navigateTo('dashboard');
	})

	document.getElementById('btn-friends-add')?.addEventListener('click', async () => {
		const nick = (document.getElementById('input-friends-add') as HTMLInputElement).value;

		if (nick) {
			try {
				await friendsService.sendFriendRequest({
					nick
				})

				showModal({
					title: "Convite enviado!",
					message: `O pedido de amizade para ${nick} foi enviado`,
					type: "success",
					confirmText: "OK"
				});
			} catch (e: any) {
				console.error('Erro capturado:', e);
                const errorMessage = e.message || e.response?.data?.error || `Não foi possível convidar ${nick}`;

                showModal({
                    title: "Erro no pedido",
                    message: errorMessage,
                    type: "danger",
                    confirmText: "Tentar novamente"
                });
            }
		}
	})
}

function setupRankingEvents() {
	document.getElementById('btn-ranking-back')?.addEventListener('click', () => {
		navigateTo('dashboard');
	})
}

function initializeRoute() {
	let hashRoute = window.location.hash.replace('#', '') as Route;
	let initialRoute = (hashRoute || 'login') as Route;

	if (!state.isAuthenticated) {
		initialRoute = 'login';
	}

	navigateTo(initialRoute, false);
}

initializeRoute()
