import Ball from './Ball.js';
import Paddle from './Paddle.js';
// Importe AIPaddle se quiser usá-lo
import AIPaddle from './AIPaddle.js';
import { CollisionSystem } from './CollisionSystem.js';
import * as Config from './constants.js';

export default class PongGame {
	// Recebe os elementos do DOM via injeção de dependência
	constructor(uiElements) {
		this.canvas = uiElements.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = Config.CANVAS_WIDTH;
		this.canvas.height = Config.CANVAS_HEIGHT;

		this.ui = uiElements;
		this.keys = {};
		this.isRunning = false;
		this.state = 'MENU';
		this.gameMode = null; // 'twoPlayers' ou 'aiMode'

		this.ball = new Ball(this.canvas.width, this.canvas.height);
		this.paddle1 = new Paddle(Config.PADDLE_PADDING, this.canvas.height);
		this.paddle2 = new Paddle(this.canvas.width - Config.PADDLE_PADDING - Config.PADDLE_WIDTH, this.canvas.height);

		this.setupEventListeners();
	}

	setupEventListeners() {
		document.addEventListener('keydown', (e) => this.keys[e.key] = true);
		document.addEventListener('keyup', (e) => this.keys[e.key] = false);

		// Botões de seleção de modo
		this.ui.twoPlayersBtn.addEventListener('click', () => this.selectGameMode('twoPlayers'));
		this.ui.aiModeBtn.addEventListener('click', () => this.selectGameMode('aiMode'));

		this.ui.startButton.addEventListener('click', () => this.startGame());

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && this.state !== 'PLAYING') {
				this.startGame();
			}
		});
	}

	selectGameMode(mode) {
		this.gameMode = mode;

		// Atualiza os botões visualmente
		this.ui.twoPlayersBtn.classList.toggle('active', mode === 'twoPlayers');
		this.ui.aiModeBtn.classList.toggle('active', mode === 'aiMode');

		// Mostra a seção de inputs
		this.ui.playerInputsSection.style.display = 'block';

		// Ajusta o label do Player 2
		if (mode === 'aiMode') {
			this.ui.player2Input.value = 'IA';
			this.ui.player2Input.disabled = true;
		} else {
			this.ui.player2Input.value = 'Player 2';
			this.ui.player2Input.disabled = false;
		}
	}

	startGame() {
		if (!this.gameMode) {
			alert('Por favor, escolha um modo de jogo!');
			return;
		}

		this.ui.gameMenu.classList.add('hidden');
		this.createPaddles();
		this.resetGame();
		this.state = 'PLAYING';
		this.gameLoop();
	}

	createPaddles() {
		this.paddle1 = new Paddle(Config.PADDLE_PADDING, this.canvas.height);

		if (this.gameMode === 'aiMode') {
			this.paddle2 = new AIPaddle(
				this.canvas.width - Config.PADDLE_PADDING - Config.PADDLE_WIDTH,
				this.canvas.height
			);
		} else {
			this.paddle2 = new Paddle(
				this.canvas.width - Config.PADDLE_PADDING - Config.PADDLE_WIDTH,
				this.canvas.height
			);
		}
	}

	resetGame() {
		this.paddle1.score = 0;
		this.paddle2.score = 0;
		this.updateScore();
		this.ball.reset(this.canvas.width, this.canvas.height);
		this.paddle1.reset(this.canvas.height);
		this.paddle2.reset(this.canvas.height);
	}

	update() {
		if (this.state !== 'PLAYING') return;

		// Movimenta as raquetes
		if (this.keys[Config.P1_UP] || this.keys[Config.P1_UP.toUpperCase()]) {
			this.paddle1.moveUp();
		}
		if (this.keys[Config.P1_DOWN] || this.keys[Config.P1_DOWN.toUpperCase()]) {
			this.paddle1.moveDown();
		}
		if (this.keys[Config.P2_UP]) {
			this.paddle2.moveUp();
		}
		if (this.keys[Config.P2_DOWN]) {
			this.paddle2.moveDown();
		}

		// Atualiza posições
		this.paddle1.update();
		// O update da paddle2 chama a lógica de IA se for uma AIPaddle
		this.paddle2.update(this.ball);
		this.ball.update();

		// Verifica colisões
		CollisionSystem.checkWallCollision(this.ball, this.canvas.height);
		CollisionSystem.checkPaddleCollision(this.ball, this.paddle1);
		CollisionSystem.checkPaddleCollision(this.ball, this.paddle2);

		// Verifica pontuação
		const score = CollisionSystem.checkScore(this.ball, this.canvas.width);
		if (score === 1) {
			this.paddle1.score++;
			this.updateScore();
			this.ball.reset(this.canvas.width, this.canvas.height);
		} else if (score === 2) {
			this.paddle2.score++;
			this.updateScore();
			this.ball.reset(this.canvas.width, this.canvas.height);
		}

		// Verifica se alguém ganhou
		if (this.paddle1.score >= Config.WINNING_SCORE || this.paddle2.score >= Config.WINNING_SCORE) {
			this.gameOver();
		}
	}

	updateScore() {
		this.ui.player1ScoreElement.textContent = this.paddle1.score.toString();
		this.ui.player2ScoreElement.textContent = this.paddle2.score.toString();
	}

	draw() {
		this.ctx.fillStyle = '#000000';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Linha central
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.setLineDash([5, 15]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.stroke();
		this.ctx.setLineDash([]);

		// Círculo central
		this.ctx.beginPath();
		this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 50, 0, Math.PI * 2);
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.stroke();

		// Objetos
		this.ball.draw(this.ctx);
		this.paddle1.draw(this.ctx);
		this.paddle2.draw(this.ctx);
	}

	gameOver() {
		this.state = 'GAME_OVER';
		cancelAnimationFrame(this.animationId);

		const winner = this.paddle1.score >= Config.WINNING_SCORE ?
			this.ui.player1Input.value || 'Player 1' :
			this.ui.player2Input.value || 'Player 2';

		setTimeout(() => {
			alert(`Game Over! ${winner} wins!`);
			this.ui.gameMenu.classList.remove('hidden');
			this.state = 'MENU';
		}, 500);
	}

	gameLoop = () => {
		this.update();
		this.draw();

		if (this.state === 'PLAYING') {
			this.animationId = requestAnimationFrame(this.gameLoop);
		}
	}
}
