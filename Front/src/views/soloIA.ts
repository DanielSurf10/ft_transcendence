    import { state, type Route } from "../store/appState";
    import { Button } from "../components/Button";

    // imgs
    import bgPotatoes from '../assets/bg-login-potatoes.png';
    import bgTomatoes from '../assets/bg-login-tomatoes.png';
    import bgDefault from '../assets/bg-login.png';

    // --- GERAÇÃO DO HTML (Async) ---
    export function getSoloIAHtml() {
        const userGang = state.user?.gang || 'potatoes';
        const isPotato = userGang === 'potatoes';

        // Estilos dinâmicos (mesmo padrão do Friends)
        const headerColor = isPotato ? 'text-yellow-500' : 'text-red-500';
        const titleDropShadow = isPotato
            ? 'drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]'
            : 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]';

        const backgroundByGang: Record<string, string> = {
            potatoes: bgPotatoes,
            tomatoes: bgTomatoes,
        };

        const backgroundImage = backgroundByGang[userGang] || bgDefault;

        return `
            <img src="${backgroundImage}" alt="Background"
                class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30" />

            <div id="solo-ia-view-root"
                class="min-h-screen p-4 md:p-6 flex flex-col items-center w-full max-w-6xl mx-auto">

                <!-- Header -->
                <div class="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end
                            gap-4 mb-6 md:mb-8 border-b border-white/10 pb-4">
                    <h2 class="${headerColor} text-4xl md:text-5xl font-bold tracking-widest ${titleDropShadow}">
                        SELECIONE A DIFICULDADE
                    </h2>

                    <div class="self-end sm:self-auto">
                        ${Button({
                            id: "btn-solo-back",
                            text: "← VOLTAR",
                            variant: "ghost",
                            className: "w-auto min-w-[120px] max-w-[200px]",
                        })}
                    </div>
                </div>

                <!-- Conteúdo -->
                <div class="w-full flex flex-col items-center justify-center gap-6 mt-8 md:mt-12 max-w-md">

                    <button id="btn-solo-easy"
                        class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                            font-bold text-xl bg-green-600/20 text-green-400
                            border border-green-500/30 hover:bg-green-600/30 transition">
                        🤖 Fácil
                    </button>

                    <button id="btn-solo-medium"
                        class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                            font-bold text-xl bg-yellow-600/20 text-yellow-400
                            border border-yellow-500/30 hover:bg-yellow-600/30 transition">
                        🤖 Médio
                    </button>

                    <button id="btn-solo-hard"
                        class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                            font-bold text-xl bg-red-600/20 text-red-400
                            border border-red-500/30 hover:bg-red-600/30 transition">
                        🤖 Difícil
                    </button>

                </div>
            </div>
        `;
    }

    // --- LÓGICA ---
    export function setupSoloIAEvents(navigate: (route: Route) => void) {
        document
            .getElementById('btn-solo-easy')
            ?.addEventListener('click', () => navigate('soloIA'));

        document
            .getElementById('btn-solo-medium')
            ?.addEventListener('click', () => navigate('soloIA'));

        document
            .getElementById('btn-solo-hard')
            ?.addEventListener('click', () => navigate('soloIA'));

        document
            .getElementById('btn-solo-back')
            ?.addEventListener('click', () => navigate('dashboard'));
    }
