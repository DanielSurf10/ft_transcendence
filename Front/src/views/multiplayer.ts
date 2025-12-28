import { state, type Route } from "../store/appState";
import { Button } from "../components/Button";

// imgs
import bgPotatoes from "../assets/bg-login-potatoes.png";
import bgTomatoes from "../assets/bg-login-tomatoes.png";
import bgDefault from "../assets/bg-login.png";

// --- GERAÇÃO DO HTML ---
export function getMultiplayerHtml() {
    const userGang = state.user?.gang || "potatoes";
    const isPotato = userGang === "potatoes";
   
    // Estilos dinâmicos
    const headerColor = isPotato ? "text-yellow-500" : "text-red-500";
    const titleDropShadow = isPotato
        ? "drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
        : "drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]";

    const backgroundByGang: Record<string, string> = {
        potatoes: bgPotatoes,
        tomatoes: bgTomatoes,
    };

    const backgroundImage = backgroundByGang[userGang] || bgDefault;

    return `
        <img src="${backgroundImage}" alt="Background"
             class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30" />

        <div id="solo-multiplayer-view-root"
             class="min-h-screen p-4 md:p-6 flex flex-col items-start w-full max-w-6xl mx-auto">

            <!-- Header -->
            <div class="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end
                        gap-4 mb-6 border-b border-white/10 pb-4">
                <h2 class="${headerColor} text-4xl md:text-5xl font-bold tracking-widest ${titleDropShadow}">
                    MULTIPLAYER
                </h2>

    `;
}

// --- LÓGICA ---
export function setupMultiplayerEvents(navigate: (route: Route) => void) {
    document
        .getElementById('btn-multi-back')
        ?.addEventListener('click', () => navigate('dashboard'));
}
