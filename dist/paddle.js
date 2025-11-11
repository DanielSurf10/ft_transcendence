"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paddle = void 0;
class Paddle {
    x;
    y;
    width;
    height;
    speed;
    score;
    isAI;
    constructor(x, canvasHeight, isAI = false) {
        this.width = 10;
        this.height = 80;
        this.x = x;
        this.y = canvasHeight / 2 - this.height / 2;
        this.speed = 8;
        this.score = 0;
        this.isAI = isAI;
    }
    update(canvasHeight, ball) {
        if (this.isAI && ball) {
            this.aiMove(canvasHeight, ball);
        }
        // Mantém a raquete dentro dos limites
        if (this.y < 0)
            this.y = 0;
        if (this.y + this.height > canvasHeight)
            this.y = canvasHeight - this.height;
    }
    // Movimento simples da IA
    aiMove(canvasHeight, ball) {
        const paddleCenter = this.y + this.height / 2;
        const ballCenter = ball.y;
        // A IA tem um tempo de reação e ocasionalmente erra
        if (Math.random() < 0.02)
            return; // Às vezes não reage
        // Move em direção à bola com pequeno erro
        const error = (Math.random() - 0.5) * 20;
        const targetY = ballCenter + error - this.height / 2;
        // Move gradualmente
        if (targetY > this.y) {
            this.y += Math.min(this.speed * 0.7, targetY - this.y);
        }
        else if (targetY < this.y) {
            this.y -= Math.min(this.speed * 0.7, this.y - targetY);
        }
    }
    moveUp() {
        this.y -= this.speed;
    }
    moveDown() {
        this.y += this.speed;
    }
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Adiciona um efeito visual nas raquetes
        ctx.fillStyle = this.isAI ? '#ff4444' : '#4444ff';
        ctx.fillRect(this.x, this.y + this.height / 2 - 10, this.width, 20);
    }
    reset(canvasHeight) {
        this.y = canvasHeight / 2 - this.height / 2;
    }
}
exports.Paddle = Paddle;
//# sourceMappingURL=paddle.js.map