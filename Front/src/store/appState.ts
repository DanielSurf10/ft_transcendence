export type Route = 
|'login' 
| 'register'
| '2fa'
| '2fa-disable'
| 'dashboard'
| 'game'
| 'game-solo'
| 'profile'
| 'friends'
| 'leaderboard'
| 'settings'
| 'login2fa'
| 'soloIA'
| 'multiplayer';

export interface User {
    id: number;
    name: string;
    nick: string;
    avatar?: string;
    gameAvatar?: string;
    isAnonymous: boolean;
    score: number;
    rank: number;
    isOnline: boolean;
    gang: 'potatoes' | 'tomatoes'
    has2FA: boolean;
}

interface State {
    user: User | null;
    isAuthenticated: boolean;
}

const savedState = localStorage.getItem('appState');

export const state: State = {
    user: savedState ? JSON.parse(savedState).user : null,
    isAuthenticated: savedState ? true : false,
};

export function saveState() {
    localStorage.setItem('appState', JSON.stringify(state));
}