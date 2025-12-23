import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { state } from "@/main";
import { friendsService, type FriendsListResponse } from "@/services/friendsRoutes";


// Interface para tipagem
interface Friend {
	id: number;
	name: string;
	avatar: string;
	isOnline: boolean;
}

interface FriendRequest {
	id: number;
	name: string;
	avatar: string;
}

// Mapeamento de backgrounds por gangue
const backgroundByGang = {
	potatoes: 'src/assets/bg-login-potatoes.png',
	tomatoes: 'src/assets/bg-login-tomatoes.png',
};

// Mock de dados
const mockFriends: Friend[] = [
	{ id: 1, name: "Batata_Assassina", avatar: "src/assets/perfil-inexistente.png", isOnline: true },
	{ id: 2, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 3, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 4, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 5, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 6, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 7, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 8, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 9, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 10, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 11, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 12, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 13, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 14, name: "Tomate_Guerreiro", avatar: "src/assets/perfil-tomate.png", isOnline: false },
	{ id: 15, name: "Mr_Chips", avatar: "src/assets/perfil-batata.png", isOnline: true },
];

const mockRequests: FriendRequest[] = [
	{ id: 102, name: "Dr_Brocolis_O_Destruidor_De_Mundos", avatar: "src/assets/avatar-broc.png" },
	{ id: 101, name: "Cebola_Chorona", avatar: "src/assets/avatar-onion.png" },
	{ id: 105, name: "Capim_maluco", avatar: "src/assets/avatar-broc.png" },
	{ id: 106, name: "Maca_doida", avatar: "src/assets/avatar-broc.png" },
	{ id: 107, name: "jogador_lol", avatar: "src/assets/avatar-broc.png" },
	{ id: 108, name: "amor_alucinante", avatar: "src/assets/avatar-broc.png" },
];

function formatName(name: string): string {
	if (name.length <= 20) return name;
	return name.substring(0, 20) + '...';
}

function renderRequestItem(request: FriendRequest): string {
	const displayName = formatName(request.name);

	return `
		<div class="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 mb-2 w-full">
			<div class="flex items-center gap-3 min-w-0 overflow-hidden mr-2">
				<div class="w-8 h-8 shrink-0 rounded-full bg-slate-700 overflow-hidden border border-white/10">
					<img src="${request.avatar}" alt="${request.name}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${request.name}&background=random'"/>
				</div>
				<span class="text-sm md:text-xs lg:text-sm text-gray-200 font-bold whitespace-nowrap" title="${request.name}">
					${displayName}
				</span>
			</div>

			<div class="flex gap-1 shrink-0">
				${Button({
					id: `btn-friends-accept-${request.id}`,
					variant: "ghost",
					icon: "check",
					title: "Aceitar",
					className: "btn-friends-accept"
				})}

				${Button({
					id: `btn-friends-deny-${request.id}`,
					variant: "ghost",
					icon: "x",
					title: "Recusar",
					className: "btn-friends-deny"
				})}
			</div>
		</div>
	`;
}

function renderFriendItem(friend: Friend): string {
	const statusColor = friend.isOnline ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-gray-500";
	const statusText = friend.isOnline ? "Online" : "Offline";

	return `
		<div class="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 mb-3 backdrop-blur-sm">
			<div class="flex items-center gap-4">
				<div class="relative">
					<div class="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white/10">
						<img src="${friend.avatar}" alt="${friend.name}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${friend.name}&background=random'"/>
					</div>
					<div class="absolute bottom-0 right-0 w-3.5 h-3.5 ${statusColor} rounded-full border-2 border-slate-900" title="${statusText}"></div>
				</div>

				<div class="flex flex-col">
					<span class="text-white font-bold tracking-wide">${friend.name}</span>
					<span class="text-xs ${friend.isOnline ? "text-green-400" : "text-gray-400"} uppercase font-semibold tracking-wider">
						${statusText}
					</span>
				</div>
			</div>

			<div class="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				${Button({
					id: `btn-friend-remove-${friend.id}`,
					title: "Remover Amigo",
					variant: "ghost",
					icon: "trash",
					className: "btn-friend-remove",
				})}
			</div>
		</div>
	`;
}

export async function getFriendsHtml() {
		// Obter gangue do usuário
	const userGang = state.user?.gang || 'potatoes';
	const isPotato = userGang === 'potatoes';

	// Cores customizáveis por gangue
	const headerColor = isPotato ? 'text-yellow-500' : 'text-red-500';
	const titleDropShadow = isPotato ? 'drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]';
	const accentColor = isPotato ? 'text-yellow-400' : 'text-red-400';
	const buttonVariant = isPotato ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-red-600 hover:bg-red-500';

	// Background customizável por gangue
	const backgroundImage = backgroundByGang[userGang];

	let friendsListHtml: string = '';
	let mappedFriends;
	let friendCount: Number = 0;

	try {
		const friendsList = await friendsService.listFriends();
		mappedFriends = friendsList.map((response: FriendsListResponse): Friend => ({
			id: response.id,
			name: response.name,
			avatar: response.avatar || `src/assets/avatar-onion.png`,
			isOnline: response.isOnline || false,
		}));

		friendCount = mappedFriends.length
		
		console.log(mappedFriends)

		friendsListHtml = mappedFriends.length !== 0 
			? mappedFriends.map(renderFriendItem).join('')
			: `<div class="flex flex-col items-center justify-center py-12 text-center opacity-60">
			<span class="text-4xl mb-4">Forever Alone? 🥔</span>
			<p class="text-gray-400 text-lg">Você ainda não tem amigos adicionados.</p>
			</div>`;

		console.log(friendsListHtml)
	} catch (error) {
		console.error('Erro ao listar amigos:', error);
	}


	const requestsListHtml = mockRequests.length > 0
		? mockRequests.map(renderRequestItem).join('')
		: `<div class="text-center py-4 text-gray-500 text-sm italic">Nenhuma solicitação pendente.</div>`;

	return `
		<img src="${backgroundImage}" alt="Background" class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30" />

		<div class="min-h-screen p-4 md:p-6 flex flex-col items-center w-full max-w-7xl mx-auto">

			<div class="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8 border-b border-white/10 pb-4">
				<h2 class="${headerColor} text-4xl md:text-5xl font-bold tracking-widest ${titleDropShadow}">					AMIGOS
				</h2>
				<div class="self-end sm:self-auto">
					${Button({
						id: "btn-friends-back",
						text: "← VOLTAR",
						variant: "ghost",
						className: "w-auto min-w-[120px] max-w-[200px]",
					})}
				</div>
			</div>

			<div class="w-full flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 h-auto lg:h-[calc(100vh-200px)]">

				<div class="w-full lg:w-1/3 flex flex-col gap-4 h-auto lg:h-full">

					<div class="bg-slate-900/60 backdrop-blur-md p-4 md:p-6 rounded-xl border border-white/10 shadow-xl shrink-0 flex flex-col">
						<h3 class="text-lg md:text-xl text-white font-bold mb-3 md:mb-4 flex items-center gap-2">
							<span class="text-yellow-400">⚡</span> Adicionar
						</h3>
						<p class="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">Busque pelo nome exato para enviar um convite.</p>

						<div class="flex flex-col gap-3 md:gap-4">
							${Input({
								id: "input-friends-add",
								placeholder: "Nome do usuário...",
								type: "text"
							})}

							${Button({
								id: "btn-friends-add",
								text: "Adicionar +",
								title: "Enviar solicitação de amizade",
							})}
						</div>
					</div>

					<div class="bg-slate-900/60 backdrop-blur-md p-4 md:p-6 rounded-xl border border-white/10 shadow-xl flex-1 flex flex-col min-h-[300px] lg:min-h-0">
						<div class="flex justify-between items-center mb-3 md:mb-4 shrink-0">
							<h3 class="text-base md:text-lg text-white font-bold flex items-center gap-2">
								<span class="text-pink-400">💌</span> Solicitações
							</h3>
							${mockRequests.length > 0 ? `<span class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">${mockRequests.length}</span>` : ''}
						</div>

						<div class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/2 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-cyan-600/30 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:hover:bg-cyan-600/80">
							${requestsListHtml}
						</div>
					</div>
				</div>

				<div class="w-full lg:w-2/3 h-auto lg:h-full min-h-[400px] lg:min-h-0">
					<div class="bg-slate-900/60 backdrop-blur-md p-4 md:p-6 rounded-xl border border-white/10 shadow-xl h-full flex flex-col">
						<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
							<h3 class="text-lg md:text-xl text-white font-bold flex items-center gap-2">
								<span class="text-blue-400">👥</span> Sua Lista
							</h3>
							<span class="text-xs font-mono text-cyan-500 bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/30">
								${friendCount} / 50
							</span>
						</div>

						<div class="overflow-y-auto flex-1 pr-1 md:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/2 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-cyan-600/30 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:hover:bg-cyan-600/80">
							${friendsListHtml}
						</div>
					</div>
				</div>

			</div>
		</div>
	`;
}
