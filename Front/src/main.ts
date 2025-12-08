import './style.css';
import { showModal } from './utils/modalManager';
import { getDashboardHtml } from './views/dashboard';

import { getLoginHtml } from './views/login';
import { getProfileHtml } from './views/profile';
import { getRegisterHtml } from './views/register';

type Route = 'login' | 'register' | '2fa' | 'dashboard' | 'game' | 'profile';

interface User {
	id: number;
	name: string;
	nick: string;
	isAnonymous: boolean;
	gang: 'batatas' | 'tomates'
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

function renderView(route: Route) {
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
				return;
			}

			app.innerHTML = getProfileHtml();

			const inputProfileName = document.getElementById('input-profile-name') as HTMLInputElement;
			if (inputProfileName && state.user) {
				inputProfileName.value = state.user.name;
			}

			setupProfileEvents();
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
	document.getElementById('btn-login-user')?.addEventListener('click', () => {
		const user = (document.getElementById('input-login-user') as HTMLInputElement).value;
		const pass = (document.getElementById('input-login-pass') as HTMLInputElement).value;

		if (user && pass) {
			// Fazer requisição de login aqui

			state.isAuthenticated = true;
			state.user = {
				id: 1,
				name: user,
				nick: user,
				gang: Math.random() < 0.5 ? 'batatas' : 'tomates',
				isAnonymous: false
			};

			localStorage.setItem('appState', JSON.stringify(state));
			navigateTo('dashboard');
		}
	})

	document.getElementById('btn-login-guest')?.addEventListener('click', () => {
		const userAnonymous = (document.getElementById('input-login-guest') as HTMLInputElement).value;

		if (userAnonymous) {
			// Fazer requisição de login aqui

			state.isAuthenticated = true;
			state.user = {
				id: 1,
				name: userAnonymous,
				nick: userAnonymous,
				gang: Math.random() < 0.5 ? 'batatas' : 'tomates',
				isAnonymous: false
			};
			localStorage.setItem('appState', JSON.stringify(state));
			navigateTo('dashboard');
		}
	})

	document.getElementById('btn-register')?.addEventListener('click', () => {
		navigateTo('register');
	})
}

function setupRegisterEvents() {
	document.getElementById('btn-register-back')?.addEventListener('click', () => {
		navigateTo('login');
	})

	document.getElementById('btn-register-submit')?.addEventListener('click', () => {
		const name = (document.getElementById('input-register-name') as HTMLInputElement).value;
		const nick = (document.getElementById('input-register-nick') as HTMLInputElement).value;
		const email = (document.getElementById('input-register-email') as HTMLInputElement).value;
		const pass = (document.getElementById('input-register-pass') as HTMLInputElement).value;
		const gang = (document.getElementById('select-register-gang') as HTMLSelectElement).value;

		if (name && nick && email && pass && gang) {
			// Fazer requisição de registro aqui

			showModal({
				title: "Bem-vindo!",
				message: `A conta de ${name} foi criada com sucesso. Prepare-se para a batalha!`,
				type: "success",
				confirmText: "Ir para Login",
				onConfirm: () => {
					navigateTo('login'); // Só navega quando o usuário clica no botão do modal
				}
			});
		} else {
			showModal({
				title: "Erro no cadastro",
				message: "Por favor, preencha todos os campos para criar sua conta.",
				type: "danger",
				confirmText: "Tentar novamente"
			});
		}
	})
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
			onConfirm: () => {
				state.user = null;
				state.isAuthenticated = false;
				localStorage.removeItem('appState');
				navigateTo('login');
			}
		});
	})

	document.getElementById('btn-dashboard-profile')?.addEventListener('click', () => {
		navigateTo('profile');
	})
}

function setupGameEvents() {

}

function setupProfileEvents() {
	document.getElementById('btn-profile-back')?.addEventListener('click', () => {
		navigateTo('dashboard');
	})

	document.getElementById('btn-profile-save')?.addEventListener('click', () => {
		const name = (document.getElementById('input-profile-name') as HTMLInputElement).value;

		if (name) {
			// Fazer requisição de atualização de perfil aqui

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

function initializeRoute() {
	let hashRoute = window.location.hash.replace('#', '') as Route;
	let initialRoute = (hashRoute || 'login') as Route;

	if (!state.isAuthenticated) {
		initialRoute = 'login';
	}

	navigateTo(initialRoute, false);
}

initializeRoute()
