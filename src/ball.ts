export class Ball {
    x!: number;
    y!: number;
    radius: number;
    speedX!: number;
    speedY!: number;
    baseSpeed: number;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.radius = 8;
        this.baseSpeed = 5;
        this.reset(canvasWidth, canvasHeight);
    }

    reset(canvasWidth: number, canvasHeight: number): void {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.speedX = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
        this.speedY = (Math.random() - 0.5) * this.baseSpeed;

        // Garante uma velocidade mínima no eixo Y
        if (Math.abs(this.speedY) < 1) {
            this.speedY = this.speedY > 0 ? 1 : -1;
        }
    }

    update(canvasWidth: number, canvasHeight: number): void {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.closePath();
    }

    // Aumenta gradualmente a velocidade para manter o jogo emocionante
    increaseSpeed(): void {
        this.speedX *= 1.02;
        this.speedY *= 1.02;
    }
}
