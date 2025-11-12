// Não precisa de 'default' pois exportamos múltiplos métodos estáticos
export class CollisionSystem {
	static checkWallCollision(ball, canvasHeight) {
		// ... (código idêntico ao original)
		if (ball.y - ball.radius <= 0) {
			ball.y = ball.radius;
			ball.speedY = Math.abs(ball.speedY);
		} else if (ball.y + ball.radius >= canvasHeight) {
			ball.y = canvasHeight - ball.radius;
			ball.speedY = -Math.abs(ball.speedY);
		}
	}

	static checkPaddleCollision(ball, paddle) {
		// ... (código idêntico ao original)
		const ballLeft = ball.x - ball.radius;
		const ballRight = ball.x + ball.radius;
		const ballTop = ball.y - ball.radius;
		const ballBottom = ball.y + ball.radius;

		const paddleLeft = paddle.x;
		const paddleRight = paddle.x + paddle.width;
		const paddleTop = paddle.y;
		const paddleBottom = paddle.y + paddle.height;

		if (ballRight >= paddleLeft &&
			ballLeft <= paddleRight &&
			ballBottom >= paddleTop &&
			ballTop <= paddleBottom) {

			this.handlePaddleBounce(ball, paddle);
			return true;
		}

		return false;
	}

	static handlePaddleBounce(ball, paddle) {
		// Inverte a direção X
		ball.speedX = -ball.speedX;

		// Ajusta o ângulo baseado em onde a bola acertou a raquete
		const hitPosition = (ball.y - paddle.y) / paddle.height; // 0 a 1

		// Proposta 3: Aleatoriedade (ex: +/- 5 graus)
		const randomness = (Math.random() - 0.5) * (Math.PI / 36);

		// Proposta 1: Ângulo máximo maior (ex: 72 graus)
		const MAX_BOUNCE_ANGLE = Math.PI / 2.5;
		const angle = (hitPosition - 0.5) * MAX_BOUNCE_ANGLE + randomness;

		// Calcula as novas velocidades
		const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
		ball.speedX = Math.cos(angle) * speed * Math.sign(ball.speedX);
		ball.speedY = Math.sin(angle) * speed;

		// Proposta 2: Garantir velocidade Y mínima para evitar loops
		const MIN_Y_SPEED_RATIO = 0.2; // 20% da velocidade horizontal
		const minSpeedY = Math.abs(ball.speedX * MIN_Y_SPEED_RATIO);

		if (Math.abs(ball.speedY) < minSpeedY) {
			// Se a bola está indo devagar, force-a a ter uma velocidade mínima
			ball.speedY = ball.speedY >= 0 ? minSpeedY : -minSpeedY;
		}

		// Ajusta a posição para evitar colisões múltiplas
		if (ball.speedX > 0) {
			ball.x = paddle.x + paddle.width + ball.radius;
		} else {
			ball.x = paddle.x - ball.radius;
		}

		// Aumenta ligeiramente a velocidade
		ball.increaseSpeed();
	}

	static checkScore(ball, canvasWidth) {
		// ... (código idêntico ao original)
		if (ball.x - ball.radius <= 0) {
			return 2;
		} else if (ball.x + ball.radius >= canvasWidth) {
			return 1;
		}
		return 0;
	}
}
