import { Button } from "../components/Button";
import { state, type Route } from "../store/appState";
import { api } from "../services/api"; 
import { friendsService } from "../services/friendsRoutes";
import { getSocket, multiplayerService } from "../services/gameSocket"; // IMPORTANTE: Importar o socket
import { showModal } from "../utils/modalManager";
import { initGameSocket } from "../services/gameSocket";
import { setTransitioning } from "../services/gameSocket"; // Importe a nova função

// imgs
import bgPotatoes from "../assets/bg-login-potatoes.png";
import bgTomatoes from "../assets/bg-login-tomatoes.png";

// --- TIPOS ---
interface Player {
    id: number;
    nick: string;
    avatar: string;
    isOnline: boolean;
}

interface InviteItem {
    senderNick: string;
    senderAvatar: string;
}

// --- CONFIGURAÇÃO VISUAL ---
const backgroundByGang = {
    potatoes: bgPotatoes,
    tomatoes: bgTomatoes,
};

// --- HELPER FUNCTIONS ---
function formatNick(nick: string): string {
    if (!nick) return 'Desconhecido';
    if (nick.length <= 20) return nick;
    return nick.substring(0, 20) + '...';
}

function renderInviteItem(invite: InviteItem): string {
    const displayNick = formatNick(invite.senderNick);
    const cardId = `invite-card-${invite.senderNick.replace(/\s/g, '')}`;

    return `
        <div id="${cardId}" class="group flex items-center justify-between gap-3 p-3
                    bg-black/20 rounded-lg border border-white/5 mb-2 w-full
                    hover:bg-white/5 transition-all duration-200">
            <div class="flex items-center gap-3 min-w-0 overflow-hidden">
                <div class="w-9 h-9 shrink-0 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                    <img src="${invite.senderAvatar}" alt="${invite.senderNick}" class="w-full h-full object-cover"
                         onerror="this.src='https://ui-avatars.com/api/?name=${invite.senderNick}&background=random'"/>
                </div>
                <span class="text-sm text-gray-200 font-bold whitespace-nowrap">${displayNick}</span>
            </div>
            <div class="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ${Button({
                    id: `btn-invite-accept-${invite.senderNick}`,
                    variant: "ghost",
                    icon: "check",
                    className: "btn-invite-action hover:text-green-400 hover:bg-green-500/20",
                    attributes: `data-action="accept" data-nick="${invite.senderNick}" data-card-id="${cardId}"`
                })}
                ${Button({
                    id: `btn-invite-decline-${invite.senderNick}`,
                    variant: "ghost",
                    icon: "x",
                    className: "btn-invite-action hover:text-red-400 hover:bg-red-500/20",
                    attributes: `data-action="decline" data-nick="${invite.senderNick}" data-card-id="${cardId}"`
                })}
            </div>
        </div>
    `;
}

function renderRankedColumn(invites: InviteItem[]): string {
    const invitesHtml = invites.length > 0
        ? invites.map(renderInviteItem).join('')
        : `<div class="flex flex-col items-center justify-center h-full text-center text-gray-400 italic gap-2 py-8 opacity-60">
                <span class="text-2xl">🕰️</span>
                <p>Ninguém te chamou ainda...</p>
           </div>`;

    return `
        <div class="w-full lg:w-1/2 flex flex-col gap-4 h-auto lg:h-full">
            <div class="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl text-center">
                <h3 class="text-yellow-500 font-bold tracking-widest mb-4 text-xl">COMPETITIVO</h3>
                ${Button({
                    id: "btn-ranked-play",
                    text: "🏆 PROCURAR PARTIDA",
                    className: "w-full text-lg tracking-widest font-bold py-4 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 border border-yellow-400/30 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                })}
                 <p id="ranked-status-text" class="text-xs text-gray-400 mt-3 h-4 min-h-[1rem]"></p>
            </div>
            <div class="bg-slate-900/60 backdrop-blur-md p-4 md:p-6 rounded-xl border border-white/10 shadow-xl flex-1 flex flex-col">
                <h4 class="text-sm uppercase tracking-widest text-gray-400 mb-3">Convites Pendentes</h4>
                <div class="flex-1 overflow-y-auto pr-1 md:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-cyan-600/30 [&::-webkit-scrollbar-thumb]:rounded">
                    ${invitesHtml}
                </div>
            </div>
        </div>
    `;
}

function renderFriendItem(friend: Player): string {
    const displayNick = formatNick(friend.nick);
    const statusText = friend.isOnline ? "Online" : "Offline";
    const isDisabled = !friend.isOnline;
    const buttonClass = isDisabled 
        ? "bg-gray-600 opacity-50 cursor-not-allowed" 
        : "bg-green-600 hover:bg-green-700 btn-friend-invite";

    return `
        <div class="group flex items-center justify-between gap-3 p-3 bg-black/20 rounded-lg border border-white/5 mb-2 w-full hover:bg-white/5 transition-all duration-200">
            <div class="flex items-center gap-3 min-w-0 overflow-hidden">
                <div class="relative">
                    <div class="w-9 h-9 shrink-0 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                        <img src="${friend.avatar}" alt="${friend.nick}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${friend.nick}&background=random'"/>
                    </div>
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'} border border-slate-900"></span>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm text-gray-200 font-bold whitespace-nowrap">${displayNick}</span>
                    <span class="text-[10px] uppercase tracking-wider ${friend.isOnline ? 'text-green-400' : 'text-gray-400'}">${statusText}</span>
                </div>
            </div>
            <div class="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                ${Button({
                    id: `btn-invite-friend-${friend.id}`,
                    text: "Desafiar",
                    variant: "primary",
                    className: `text-white text-xs px-3 py-1 ${buttonClass}`,
                    attributes: `data-id="${friend.id}" data-nick="${friend.nick}" ${isDisabled ? 'disabled' : ''}`
                })}
            </div>
        </div>
    `;
}

function renderCasualColumn(friends: Player[], error?: boolean): string {
    let contentHtml = '';

    if (error) {
        contentHtml = `
            <div class="flex flex-col items-center justify-center h-full text-center text-red-400 italic gap-2 py-8">
                <span class="text-2xl">⚠️</span>
                <p>Erro ao conectar com o servidor.</p>
                <p class="text-xs text-gray-500">Verifique se o backend está rodando.</p>
            </div>
        `;
    } else if (friends.length > 0) {
        contentHtml = friends.map(renderFriendItem).join('');
    } else {
        contentHtml = `
            <div class="flex flex-col items-center justify-center h-full text-center text-gray-400 italic gap-2 py-8 opacity-60">
                <span class="text-2xl">🦗</span>
                <p>Nenhum amigo encontrado.</p>
                <p class="text-sm text-gray-500">Adicione amigos no seu perfil!</p>
            </div>
        `;
    }

    return `
        <div class="w-full lg:w-1/2 flex flex-col gap-4 h-auto lg:h-full">
            <div class="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
                <h3 class="text-lg tracking-widest font-bold text-white flex items-center gap-2">🎮 AMISTOSO</h3>
                <p class="text-sm text-gray-400 mt-1">Convide um amigo para um x1 sem perder pontos.</p>
            </div>
            <div class="bg-slate-900/60 backdrop-blur-md p-4 md:p-6 rounded-xl border border-white/10 shadow-xl flex-1 flex flex-col">
                <h4 class="text-sm uppercase tracking-widest text-gray-400 mb-3">Amigos Online</h4>
                <div class="flex-1 overflow-y-auto pr-1 md:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-cyan-600/30 [&::-webkit-scrollbar-thumb]:rounded">
                    ${contentHtml}
                </div>
            </div>
        </div>
    `;
}

export async function getMultiplayerHtml() {
    const userGang = state.user?.gang || 'potatoes';
    const backgroundImage = backgroundByGang[userGang];
    const headerColor = userGang === 'potatoes' ? 'text-yellow-500' : 'text-red-500';
    const titleShadow = userGang === 'potatoes' 
        ? 'drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
        : 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]';

    let casualFriends: Player[] = [];
    const rankedInvites: InviteItem[] = []; 
    let hasError = false;

    // TENTA BUSCAR DADOS
    try {
        const friendsList = await friendsService.listFriends();
        casualFriends = friendsList.map((f: any) => ({
            id: f.id,
            nick: f.nick,
            avatar: f.avatar || `https://ui-avatars.com/api/?name=${f.nick}&background=random`,
            isOnline: f.isOnline === true
        })).sort((a, b) => Number(b.isOnline) - Number(a.isOnline));
    } catch (error) {
        console.error("Erro ao carregar lista de amigos:", error);
        hasError = true;
    }

    return `
        <img src="${backgroundImage}" alt="Background" class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30" />
        <div id="multiplayer-view-root" class="min-h-screen p-4 md:p-6 flex flex-col items-center w-full max-w-7xl mx-auto">
            <div class="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8 border-b border-white/10 pb-4">
                <h2 class="${headerColor} text-4xl md:text-5xl font-bold tracking-widest ${titleShadow}">MULTIPLAYER</h2>
                <div class="self-end sm:self-auto">
                    ${Button({
                        id: "btn-multiplayer-back",
                        text: "← VOLTAR",
                        variant: "ghost",
                        className: "w-auto min-w-[120px] max-w-[200px]",
                    })}
                </div>
            </div>
            <div class="w-full flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-200px)]">
                ${renderRankedColumn(rankedInvites)}
                ${renderCasualColumn(casualFriends, hasError)}
            </div>
        </div>
    `;
}

export function setupMultiplayerEvents(navigate: (route: Route) => void) {
    initGameSocket();

    document.getElementById('btn-multiplayer-back')?.addEventListener('click', async () => {
    try {
        await multiplayerService.leaveQueue(); 
    } catch (e) {
        console.warn("Falha ao sair da fila:", e);
    }
    navigate('dashboard');
});
    const viewRoot = document.getElementById('multiplayer-view-root');
    
    // --- LÓGICA DO SOCKET (IMPORTANTE PARA QUEM ESPERA NA FILA) ---
    const socket = getSocket();
    if (socket) {
        // Remove listeners antigos para evitar duplicidade
        socket.off('matchFound');
        socket.off('inviteAccepted');

        // Evento quando o sistema encontra um oponente para você
        socket.on('matchFound', (data: { roomId: string, opponentId: number }) => {
            console.log("Partida encontrada via Socket!", data);
            
            // Salva o ID da sala para a tela do jogo usar
            localStorage.setItem('currentRoomId', data.roomId);
            
            setTransitioning(true);
            // Navega para o jogo
            navigate('game');
        });

        // Evento quando alguém aceita seu convite casual
        socket.on('inviteAccepted', (data: { roomId: string }) => {
            console.log("Convite aceito!", data);
            localStorage.setItem('currentRoomId', data.roomId);
            navigate('game');
        });
    }

    if (!viewRoot) return;

    viewRoot.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;

        // --- RANKED MATCHMAKING ---
        const btnRanked = target.closest('#btn-ranked-play') as HTMLButtonElement;
        if (btnRanked) {
            const statusText = document.getElementById('ranked-status-text');
            const originalText = btnRanked.innerText;
            
            btnRanked.innerText = "⏳ BUSCANDO...";
            btnRanked.disabled = true;
            if (statusText) statusText.textContent = "Conectando ao matchmaking...";

            try {
                const response = await api.get<any>('/game/ranked');
                
                if (response.status === 'match_found') {
                    if (statusText) statusText.textContent = "Partida encontrada! Redirecionando...";
                    
                    // Salva o ID da sala
                    localStorage.setItem('currentRoomId', response.roomId);
                    setTransitioning(true);
                    setTimeout(() => navigate('game'), 500);
                } else {
                    if (statusText) statusText.textContent = response.message || "Na fila. Aguarde...";
                    btnRanked.innerText = "NA FILA...";
                    // AGORA: O socket.on('matchFound') acima vai lidar com a resposta quando o oponente chegar.
                }
            } catch (error: any) {
                console.error(error);
                btnRanked.innerText = originalText;
                btnRanked.disabled = false;
                if (statusText) statusText.textContent = "Erro de conexão.";
                
                showModal({
                    title: "Erro de Conexão",
                    message: "Não foi possível conectar. Verifique se o backend está rodando.",
                    type: "danger",
                    confirmText: "Ok"
                });
            }
            return;
        }

        // --- ACEITAR / RECUSAR CONVITE ---
        const actionBtn = target.closest('.btn-invite-action') as HTMLElement;
        if (actionBtn) {
            const action = actionBtn.dataset.action as 'accept' | 'decline';
            const nick = actionBtn.dataset.nick;
            const cardId = actionBtn.dataset.cardId;

            if (!action || !nick) return;

            try {
                const response = await api.post<any>('/game/casual/response', { nick, action });

                if (action === 'accept' && response.status === 'accepted') {
                    localStorage.setItem('currentRoomId', response.roomId);
                    navigate('game');
                } else if (cardId) {
                    document.getElementById(cardId)?.remove();
                }
            } catch (error: any) {
                showModal({
                    title: "Erro",
                    message: "Erro ao processar convite.",
                    type: "danger",
                    confirmText: "Ok",
                    onConfirm: () => { if (cardId) document.getElementById(cardId)?.remove(); }
                });
            }
            return;
        }

        // --- CONVIDAR AMIGO ---
        const inviteFriendBtn = target.closest('.btn-friend-invite') as HTMLElement;
        if (inviteFriendBtn) {
            if (inviteFriendBtn.hasAttribute('disabled') || inviteFriendBtn.classList.contains('bg-gray-600')) return;

            const nick = inviteFriendBtn.dataset.nick;
            if (!nick) return;

            inviteFriendBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            inviteFriendBtn.classList.add('bg-gray-600', 'cursor-not-allowed', 'opacity-70');
            inviteFriendBtn.textContent = 'Enviando...';

            try {
                await api.post('/game/casual/invite', { nick });
                inviteFriendBtn.textContent = 'Convidado!';
            } catch (error: any) {
                console.error(error);
                inviteFriendBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                inviteFriendBtn.classList.remove('bg-gray-600', 'cursor-not-allowed', 'opacity-70');
                inviteFriendBtn.textContent = 'Desafiar';

                showModal({
                    title: "Erro",
                    message: "Não foi possível enviar o convite.",
                    type: "danger",
                    confirmText: "Ok"
                });
            }
        }
    });
}