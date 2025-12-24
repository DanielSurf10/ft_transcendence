import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { state } from "@/main";

const backgroundByGang = {
    potatoes: 'src/assets/bg-login-potatoes.png',
    tomatoes: 'src/assets/bg-login-tomatoes.png',
};

export function getLogin2FAHtml() {
    // Tenta pegar a gangue do state (definido parcialmente no primeiro passo do login)
    // Se não tiver, usa potatoes como fallback
    const user = state.user;
    const gang = user?.gang || 'potatoes';
    const isPotato = gang === 'potatoes';

    const buttonTheme = gang === 'potatoes' ? 'potatoes' : 'tomatoes';

    const titleColor = isPotato ? 'text-yellow-400' : 'text-red-400';
    const titleGlow = isPotato
        ? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]'
        : 'drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]';

    const cardBorder = isPotato ? 'border-yellow-500/30' : 'border-red-500/30';
    const cardShadow = isPotato
        ? 'shadow-[0_0_20px_rgba(234,179,8,0.15)]'
        : 'shadow-[0_0_20px_rgba(239,68,68,0.15)]';

    const backgroundImage = backgroundByGang[gang];

    return `
        <img 
            src="${backgroundImage}"
            class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
        />

        <div class="min-h-screen flex justify-center items-center p-5">

            ${Card({
                className: `
                    max-w-md w-full text-center
                    bg-slate-900/60 backdrop-blur-md
                    border ${cardBorder}
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
                            placeholder: "000 000",
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
                        theme: buttonTheme,
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