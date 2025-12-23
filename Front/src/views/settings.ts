import { state } from "@/main";

export function getSettingsHtml() {
	const selectedGang = state.user?.gang;

	const bgSrc = `src/assets/bg-login-${selectedGang}.png`;

	const settingsColor =
		selectedGang === "tomatoes"
			? "text-red-500"
			: selectedGang === "potatoes"
			? "text-yellow-500"
			: "text-cyan-500";

	// --- 2FA state ---
	const has2FA = state.user?.has2FA ?? false;

	const twoFAStatusText = has2FA
		? "Autenticação em duas etapas está ativa."
		: "Autenticação em duas etapas está desativada.";

	return `
		<img
			src="${bgSrc}"
			alt="Background"
			class="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
		/>

		<div class="min-h-screen p-6 flex flex-col items-center max-w-6xl mx-auto">

			<!-- Header -->
			<div class="w-full flex justify-between items-end mb-10 border-b border-white/10 pb-4">
				<h2 class="${settingsColor} text-5xl font-bold tracking-widest">
					SETTINGS
				</h2>

				<button
					id="btn-settings-back"
					class="text-gray-400 hover:text-white font-bold cursor-pointer"
				>
					VOLTAR
				</button>
			</div>

			<!-- Sections -->
			<div class="w-full grid grid-cols-1 gap-6">

				<!-- Security Section -->
				<div class="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
					<h3 class="text-xl font-bold text-white mb-4">
						Segurança 🔒
					</h3>

					<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

						<div>
							<p class="text-gray-300 font-medium">
								Autenticação em duas etapas (2FA)
							</p>
							<p class="text-gray-400 text-sm">
								${twoFAStatusText}
							</p>
						</div>

						<!-- 2FA Actions -->
						<div class="flex flex-col gap-2 min-w-[160px]">

							${
								has2FA
									? `
										<button
											id="btn-settings-2fa-status"
											class="px-5 py-2 rounded-lg font-bold bg-green-600/20 text-green-400 cursor-default"
										>
											2FA Ativo
										</button>

										<button
											id="btn-settings-2fa-disable"
											class="px-5 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white transition"
										>
											Desativar 2FA
										</button>
									`
									: `
										<button
											id="btn-settings-2fa-enable"
											class="px-5 py-2 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-black transition"
										>
											Ativar 2FA
										</button>
									`
							}

						</div>

					</div>
				</div>

			</div>
		</div>
	`;
}

