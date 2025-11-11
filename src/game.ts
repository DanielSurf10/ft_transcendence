import { Ball } from './ball';
import { Paddle } from './paddle';
import { CollisionSystem } from './collision';

class PongGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private ball: Ball;
    private paddle1: Paddle;
    private paddle2: Paddle;
    private keys: { [key: string]: boolean };
    private animationId: number = 0;
    private isRunning: boolean;

    // Elementos da UI
    private player1ScoreElement: HTMLElement;
    private player2ScoreElement: HTMLElement;
    private gameMenu: HTMLElement;
    private startButton: HTMLElement;
    private player1Input: HTMLInputElement;
    private player2Input: HTMLInputElement;

    constructor() {
        this.canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.keys = {};
        this.isRunning = false;

        // Inicializa elementos da UI
        this.player1ScoreElement = document.getElementById('player1Score')!;
        this.player2ScoreElement = document.getElementById('player2Score')!;
        this.gameMenu = document.getElementById('gameMenu')!;
        this.startButton = document.getElementById('startGame')!;
        this.player1Input = document.getElementById('player1Name') as HTMLInputElement;
        this.player2Input = document.getElementById('player2Name') as HTMLInputElement;

        // Inicializa objetos do jogo
        this.ball = new Ball(this.canvas.width, this.canvas.height);
        this.paddle1 = new Paddle(20, this.canvas.height, false);
        this.paddle2 = new Paddle(this.canvas.width - 30, this.canvas.height, true); // IA como player 2

        this.setupEventListeners();
        this.showMenu();
    }

    private setupEventListeners(): void {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Botão de iniciar jogo
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });

        // Enter também inicia o jogo
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isRunning) {
                this.startGame();
            }
        });
    }

    private showMenu(): void {
        this.gameMenu.classList.remove('hidden');
    }

    private hideMenu(): void {
        this.gameMenu.classList.add('hidden');
    }

    private startGame(): void {
        // Configura nomes dos jogadores (se for usar depois)
        const player1Name = this.player1Input.value || 'Player 1';
        const player2Name = this.player2Input.value || 'AI Player';

        this.hideMenu();
        this.resetGame();
        this.isRunning = true;
        this.gameLoop();
    }

    private resetGame(): void {
        this.paddle1.score = 0;
        this.paddle2.score = 0;
        this.updateScore();
        this.ball.reset(this.canvas.width, this.canvas.height);
        this.paddle1.reset(this.canvas.height);
        this.paddle2.reset(this.canvas.height);
    }

    private update(): void {
        // Movimenta as raquetes baseado nas teclas pressionadas
        if (this.keys['w'] || this.keys['W']) {
            this.paddle1.moveUp();
        }
        if (this.keys['s'] || this.keys['S']) {
            this.paddle1.moveDown();
        }
        if (this.keys['ArrowUp']) {
            this.paddle2.moveUp();
        }
        if (this.keys['ArrowDown']) {
            this.paddle2.moveDown();
        }

        // Atualiza posições
        this.paddle1.update(this.canvas.height);
        this.paddle2.update(this.canvas.height, this.ball);
        this.ball.update(this.canvas.width, this.canvas.height);

        // Verifica colisões
        CollisionSystem.checkWallCollision(this.ball, this.canvas.height);

        // Colisão com raquetes
        if (CollisionSystem.checkPaddleCollision(this.ball, this.paddle1) ||
            CollisionSystem.checkPaddleCollision(this.ball, this.paddle2)) {
            // Som de colisão (pode adicionar depois)
        }

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
        if (this.paddle1.score >= 5 || this.paddle2.score >= 5) {
            this.gameOver();
        }
    }

    private updateScore(): void {
        this.player1ScoreElement.textContent = this.paddle1.score.toString();
        this.player2ScoreElement.textContent = this.paddle2.score.toString();
    }

    private draw(): void {
        // Limpa o canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenha a linha central pontilhada
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Desenha os objetos do jogo
        this.ball.draw(this.ctx);
        this.paddle1.draw(this.ctx);
        this.paddle2.draw(this.ctx);

        // Desenha o círculo central
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 50, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.stroke();
    }

    private gameOver(): void {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);

        const winner = this.paddle1.score >= 5 ? 'Player 1' : 'Player 2';
        setTimeout(() => {
            alert(`Game Over! ${winner} wins!`);
            this.showMenu();
        }, 500);
    }

    private gameLoop = (): void => {
        this.update();
        this.draw();

        if (this.isRunning) {
            this.animationId = requestAnimationFrame(this.gameLoop);
        }
    }
}

// Inicializa o jogo quando a página carregar
window.addEventListener('load', () => {
    new PongGame();
});
