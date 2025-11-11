import { Ball } from './ball';
import { Paddle } from './paddle';

export class CollisionSystem {
    static checkWallCollision(ball: Ball, canvasHeight: number): void {
        // Colisão com topo e base
        if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.speedY = Math.abs(ball.speedY);
        } else if (ball.y + ball.radius >= canvasHeight) {
            ball.y = canvasHeight - ball.radius;
            ball.speedY = -Math.abs(ball.speedY);
        }
    }

    static checkPaddleCollision(ball: Ball, paddle: Paddle): boolean {
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;

        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;

        // Verifica se há colisão
        if (ballRight >= paddleLeft &&
            ballLeft <= paddleRight &&
            ballBottom >= paddleTop &&
            ballTop <= paddleBottom) {

            this.handlePaddleBounce(ball, paddle);
            return true;
        }

        return false;
    }

    private static handlePaddleBounce(ball: Ball, paddle: Paddle): void {
        // Inverte a direção X
        ball.speedX = -ball.speedX;

        // Ajusta o ângulo baseado em onde a bola acertou a raquete
        const hitPosition = (ball.y - paddle.y) / paddle.height; // 0 a 1
        const angle = (hitPosition - 0.5) * Math.PI / 3; // ±60 graus máximo

        // Calcula as novas velocidades
        const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
        ball.speedX = Math.cos(angle) * speed * Math.sign(ball.speedX);
        ball.speedY = Math.sin(angle) * speed;

        // Ajusta a posição para evitar colisões múltiplas
        if (ball.speedX > 0) {
            ball.x = paddle.x + paddle.width + ball.radius;
        } else {
            ball.x = paddle.x - ball.radius;
        }

        // Aumenta ligeiramente a velocidade
        ball.increaseSpeed();
    }

    static checkScore(ball: Ball, canvasWidth: number): number {
        // Retorna 1 se player 1 marcou, 2 se player 2 marcou, 0 se não marcou
        if (ball.x - ball.radius <= 0) {
            return 2; // Player 2 pontua
        } else if (ball.x + ball.radius >= canvasWidth) {
            return 1; // Player 1 pontua
        }
        return 0;
    }
}
