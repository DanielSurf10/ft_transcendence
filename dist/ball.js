"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
class Ball {
    x;
    y;
    radius;
    speedX;
    speedY;
    baseSpeed;
    constructor(canvasWidth, canvasHeight) {
        this.radius = 8;
        this.baseSpeed = 5;
        this.reset(canvasWidth, canvasHeight);
    }
    reset(canvasWidth, canvasHeight) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.speedX = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
        this.speedY = (Math.random() - 0.5) * this.baseSpeed;
        // Garante uma velocidade mínima no eixo Y
        if (Math.abs(this.speedY) < 1) {
            this.speedY = this.speedY > 0 ? 1 : -1;
        }
    }
    update(canvasWidth, canvasHeight) {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.closePath();
    }
    // Aumenta gradualmente a velocidade para manter o jogo emocionante
    increaseSpeed() {
        this.speedX *= 1.02;
        this.speedY *= 1.02;
    }
}
exports.Ball = Ball;
//# sourceMappingURL=ball.js.map