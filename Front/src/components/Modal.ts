interface ModalProps {
	title: string;
	message: string;
	type?: "success" | "danger" | "info";
}

const colors = {
	success: "text-green-400 border-green-500",
	danger: "text-red-500 border-red-500",
	info: "text-cyan-500 border-cyan-500"
};

export function ModalComponent({ title, message, type = "info" }: ModalProps) {

	const theme = colors[type];

	return `
		<div class="fixed inset-0 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
			<div class="bg-slate-900 border ${theme.split(" ")[1]} border-2 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-100 transition-all">
				<h3 class="text-3xl font-bold mb-4 ${theme.split(" ")[0]} text-center">
					${title}
				</h3>

				<p class="text-gray-300 text-center text-lg mb-8 leading-relaxed">
					${message}
				</p>

				<div class="flex gap-4 justify-center" id="modal-actions" />
			</div>
		</div>
	`;
}
