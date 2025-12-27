import { state, type Route } from './store/appState';
import './style.css';

import { authService } from './services/authRoutes';
import { disconnectGame, initGameSocket } from './services/gameSocket';
import { showModal } from './utils/modalManager';
import { GameController } from './views/game';

//Views
import * as DashboardView from './views/dashboard';
import * as FriendsView from './views/friends';
import * as GameView from './views/game';
import * as LoginView from './views/login';
import * as Login2FAView from './views/login2fa';
import * as ProfileView from './views/profile';
import * as RankingView from './views/ranking';
import * as RegisterView from './views/register';
import * as SettingsView from './views/settings';
import * as TwoFAView from './views/twofa';
import * as TwoFADisableView from './views/twofaDisable';

const app = document.querySelector<HTMLDivElement>('#app')!;
let localGameController: GameController | null = null;

// --- NAVEGAÇÃO CENTRAL ---
function navigateTo(route: Route, addToHistory = true) {
    // Guards de Autenticação
    const protectedRoutes: Route[] = ['dashboard', 'profile', 'game', 'game-solo', 'friends', 'leaderboard', 'settings', '2fa', '2fa-disable'];
    const publicRoutes: Route[] = ['login', 'register', 'login2fa'];

	if (protectedRoutes.includes(route) && !state.isAuthenticated) {
		return navigateTo('login');
	}

	if (publicRoutes.includes(route) && state.isAuthenticated) {
		return navigateTo('dashboard', false);
	}

	if (addToHistory) {
		history.pushState({ route }, '', `#${route}`);
	}

	window.location.hash = `#${route}`;
	renderView(route);
}

// --- HELPER: Bloqueio de Anônimos ---
function checkAnonymousAccess(): boolean {
	if (state.user && state.user.isAnonymous) {
		showModal({
			title: "Acesso Restrito",
			message: "Esta funcionalidade é exclusiva para membros registrados da gangue. Crie uma conta para acessar.",
			type: "danger",
			confirmText: "Voltar ao Dashboard",
			onConfirm: () => navigateTo("dashboard", false)
		});
		return true; // Bloqueado
	}
	return false; // Liberado
}

async function renderView(route: Route) {
    disconnectGame();

    if (localGameController) {
        localGameController.destroy();
        localGameController = null;
    }

	switch (route) {
		case 'login':
			app.innerHTML = LoginView.getLoginHtml();
			LoginView.setupLoginEvents(navigateTo);
			break;

		case 'login2fa':
			if (!localStorage.getItem('tempToken')) {
				navigateTo('login', false);
				return;
			}
			app.innerHTML = Login2FAView.getLogin2FAHtml();
			Login2FAView.setupLogin2FAEvents(navigateTo);
			break;

		case 'register':
			app.innerHTML = RegisterView.getRegisterHtml();
			RegisterView.setupRegisterEvents(navigateTo);
			break;

        case 'dashboard':
            app.innerHTML = DashboardView.getDashboardHtml();
            DashboardView.setupDashboardEvents(navigateTo);
            break;
            
        case 'game':
            app.innerHTML = GameView.getGameHtml();
            initGameSocket();
             break;
            
        case 'game-solo':
            app.innerHTML = GameView.getGameHtml();
            localGameController = new GameController({ difficulty: 2 });
            break;

		case 'profile':
			if (checkAnonymousAccess()) return;
			app.innerHTML = ProfileView.getProfileHtml();
			ProfileView.setupProfileEvents(navigateTo);
			break;

		case 'friends':
			if (checkAnonymousAccess()) return;
			app.innerHTML = await FriendsView.getFriendsHtml();
			FriendsView.setupFriendsEvents(navigateTo);
			break;

		case 'leaderboard':
			if (checkAnonymousAccess()) return;
			app.innerHTML = await RankingView.getRankingHtml();
			RankingView.setupRankingEvents(navigateTo);
			break;

		case 'settings':
			if (checkAnonymousAccess()) return;
			app.innerHTML = SettingsView.getSettingsHtml();
			SettingsView.setupSettingsEvents(navigateTo);
			break;

		case '2fa':
			try {
				const response = await authService.setup2FA();
				app.innerHTML = TwoFAView.get2FAHtml({
					qrCodeUrl: response.qrcode,
					secret: response.secret
				});
				TwoFAView.setup2FAEvents(navigateTo);
			} catch (error: any) {
				showModal({
					title: "Erro",
					message: error.message || "Não foi possível iniciar a configuração 2FA",
					type: "danger",
					confirmText: "Voltar",
					onConfirm: () => navigateTo('settings')
				});
			}
			break;

		case '2fa-disable':
			app.innerHTML = TwoFADisableView.get2FADisableHtml();
			TwoFADisableView.setup2FADisableEvents(navigateTo);
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
        const path = window.location.hash.replace('#', '') as Route;
        
        const validRoutes: Route[] = ['login', 'register', 'dashboard', 'game', 'game-solo', 'profile', 'friends', 'leaderboard', 'settings', '2fa', '2fa-disable', 'login2fa'];
        
        if (validRoutes.includes(path)) {
            navigateTo(path, false);
        } else {
            navigateTo('login', false);
        }
    }
});

const initialRoute = (window.location.hash.replace('#', '') as Route) || 'login';
navigateTo(initialRoute, false);
