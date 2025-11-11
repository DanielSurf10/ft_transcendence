"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ball_1 = require("./ball");
const paddle_1 = require("./paddle");
const collision_1 = require("./collision");
class PongGame {
    canvas;
    ctx;
    ball;
    paddle1;
    paddle2;
    keys;
    animationId = 0;
    isRunning;
    // Elementos da UI
    player1ScoreElement;
    player2ScoreElement;
    gameMenu;
    startButton;
    player1Input;
    player2Input;
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.isRunning = false;
        // Inicializa elementos da UI
        this.player1ScoreElement = document.getElementById('player1Score');
        this.player2ScoreElement = document.getElementById('player2Score');
        this.gameMenu = document.getElementById('gameMenu');
        this.startButton = document.getElementById('startGame');
        this.player1Input = document.getElementById('player1Name');
        this.player2Input = document.getElementById('player2Name');
        // Inicializa objetos do jogo
        this.ball = new ball_1.Ball(this.canvas.width, this.canvas.height);
        this.paddle1 = new paddle_1.Paddle(20, this.canvas.height, false);
        this.paddle2 = new paddle_1.Paddle(this.canvas.width - 30, this.canvas.height, true); // IA como player 2
        this.setupEventListeners();
        this.showMenu();
    }
    setupEventListeners() {
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
    showMenu() {
        this.gameMenu.classList.remove('hidden');
    }
    hideMenu() {
        this.gameMenu.classList.add('hidden');
    }
    startGame() {
        // Configura nomes dos jogadores (se for usar depois)
        const player1Name = this.player1Input.value || 'Player 1';
        const player2Name = this.player2Input.value || 'AI Player';
        this.hideMenu();
        this.resetGame();
        this.isRunning = true;
        this.gameLoop();
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
        collision_1.CollisionSystem.checkWallCollision(this.ball, this.canvas.height);
        // Colisão com raquetes
        if (collision_1.CollisionSystem.checkPaddleCollision(this.ball, this.paddle1) ||
            collision_1.CollisionSystem.checkPaddleCollision(this.ball, this.paddle2)) {
            // Som de colisão (pode adicionar depois)
        }
        // Verifica pontuação
        const score = collision_1.CollisionSystem.checkScore(this.ball, this.canvas.width);
        if (score === 1) {
            this.paddle1.score++;
            this.updateScore();
            this.ball.reset(this.canvas.width, this.canvas.height);
        }
        else if (score === 2) {
            this.paddle2.score++;
            this.updateScore();
            this.ball.reset(this.canvas.width, this.canvas.height);
        }
        // Verifica se alguém ganhou
        if (this.paddle1.score >= 5 || this.paddle2.score >= 5) {
            this.gameOver();
        }
    }
    updateScore() {
        this.player1ScoreElement.textContent = this.paddle1.score.toString();
        this.player2ScoreElement.textContent = this.paddle2.score.toString();
    }
    draw() {
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
    gameOver() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        const winner = this.paddle1.score >= 5 ? 'Player 1' : 'Player 2';
        setTimeout(() => {
            alert(`Game Over! ${winner} wins!`);
            this.showMenu();
        }, 500);
    }
    gameLoop = () => {
        this.update();
        this.draw();
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(this.gameLoop);
        }
    };
}
// Inicializa o jogo quando a página carregar
window.addEventListener('load', () => {
    new PongGame();
});
//# sourceMappingURL=game.js.map