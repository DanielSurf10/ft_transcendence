// Back/src/game/PongMatch.ts
import { Server } from 'socket.io';
import { GameState, PowerUpType } from '../types/game';

const FPS = 60;
const TICK_RATE = 1000 / FPS;
const PADDLE_SPEED = 10;
const MAX_SPEED = 15; // Velocidade máxima para a bola não atravessar paredes

export class PongMatch {
  private io: Server;
  private state: GameState;
  private intervalId: NodeJS.Timeout | null = null;
  private lastHitterId: string | null = null;
  
  // Controle de Movimento
  private p1MoveDir: number = 0;
  private p2MoveDir: number = 0;
  private defaultPaddleHeight = 130;

  // Controle da Bola
  private isBallMoving: boolean = false;
  private ballSpeed: number = 5; // Velocidade inicial
  private ballDir = { x: 0, y: 0 }; // Direção normalizada (apenas -1 ou 1, ou valores quebrados)
  
  private readonly WIN_SCORE = 5;

  constructor(io: Server, p1Id: string, p2Id: string) {
    this.io = io;
    this.state = {
      tableWidth: 800,
      tableHeight: 600,
      ball: { x: 400, y: 300 },
      player1: { id: p1Id, y: 250, score: 0, height: this.defaultPaddleHeight, shield: false, skin: 'tomato', nick: 'Player 1' },
      player2: { id: p2Id, y: 250, score: 0, height: this.defaultPaddleHeight, shield: false, skin: 'potato', nick: 'Player 2' },
      powerUp: null
    };

    this.setupSocketListeners();
    this.startGameLoop();
    this.startRoundTimer();
  }

  // ... (setupSocketListeners e updatePaddleDirection mantêm iguais) ...
  private setupSocketListeners() {
    const p1Socket = this.io.sockets.sockets.get(this.state.player1.id);
    const p2Socket = this.io.sockets.sockets.get(this.state.player2.id);

    if (p1Socket) {
      p1Socket.on('movePaddle', (data) => this.updatePaddleDirection(1, data.direction));
    }
    if (p2Socket) {
      p2Socket.on('movePaddle', (data) => this.updatePaddleDirection(2, data.direction));
    }
  }

  private updatePaddleDirection(playerNum: 1 | 2, direction: 'UP' | 'DOWN' | 'STOP') {
    const dirValue = direction === 'UP' ? -1 : (direction === 'DOWN' ? 1 : 0);
    if (playerNum === 1) this.p1MoveDir = dirValue;
    else this.p2MoveDir = dirValue;
  }

  private startRoundTimer() {
    this.isBallMoving = false;
    this.state.ball = { x: 400, y: 300 };
    
    // Reseta velocidade e direção
    this.ballSpeed = 5; 
    this.ballDir = { x: 0, y: 0 };

    let countdown = 3; // Reduzi para 3s para ser mais dinâmico

    const timer = setInterval(() => {
        this.io.to([this.state.player1.id, this.state.player2.id]).emit('matchStatus', `starting:${countdown}`);
        if (countdown <= 0) {
            clearInterval(timer);
            this.startBall();
        }
        countdown--;
    }, 1000);
  }

  private startBall() {
    this.isBallMoving = true;
    this.io.to([this.state.player1.id, this.state.player2.id]).emit('matchStatus', 'playing');
    
    // Define direção inicial aleatória
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = (Math.random() * 2 - 1); // Y aleatório entre -1 e 1
    
    // Normaliza o vetor para garantir velocidade constante independente do ângulo
    const length = Math.sqrt(dirX*dirX + dirY*dirY);
    this.ballDir = { x: dirX / length, y: dirY / length };
    
    this.startPowerUpSpawner(); 
  }

  private startGameLoop() {
    this.intervalId = setInterval(() => {
      this.updatePaddles();

      if (this.isBallMoving) {
          // Aceleração Progressiva: Aumenta a velocidade a cada frame
          if (this.ballSpeed < MAX_SPEED) {
              this.ballSpeed += 0.005; // Aceleração lenta e contínua
          }

          this.updateBallPhysics();
          this.checkCollisions();
          this.checkGoal();
      }
      
      this.io.to([this.state.player1.id, this.state.player2.id]).emit('gameState', this.state);
    }, TICK_RATE);
  }

  private updatePaddles() {
    const p1 = this.state.player1;
    const p2 = this.state.player2;

    if (this.p1MoveDir !== 0) {
        p1.y += this.p1MoveDir * PADDLE_SPEED;
        p1.y = Math.max(0, Math.min(this.state.tableHeight - p1.height, p1.y));
    }
    if (this.p2MoveDir !== 0) {
        p2.y += this.p2MoveDir * PADDLE_SPEED;
        p2.y = Math.max(0, Math.min(this.state.tableHeight - p2.height, p2.y));
    }
  }

  private updateBallPhysics() {
    // Move baseado na direção * velocidade atual
    this.state.ball.x += this.ballDir.x * this.ballSpeed;
    this.state.ball.y += this.ballDir.y * this.ballSpeed;

    // Colisão Teto/Chão
    if (this.state.ball.y <= 0 || this.state.ball.y >= this.state.tableHeight) {
      this.ballDir.y *= -1; // Inverte Y
    }
  }

  private checkGoal() {
    if (this.state.ball.x < -20) this.handleScore('player2');
    else if (this.state.ball.x > this.state.tableWidth + 20) this.handleScore('player1');
  }

  private handleScore(scorer: 'player1' | 'player2') {
    if (scorer === 'player1') this.state.player1.score++;
    else this.state.player2.score++;

    this.io.to([this.state.player1.id, this.state.player2.id]).emit('scoreUpdate', { scorer });

    if (this.state.player1.score >= this.WIN_SCORE || this.state.player2.score >= this.WIN_SCORE) {
        this.endMatch(this.state.player1.score >= this.WIN_SCORE ? this.state.player1.id : this.state.player2.id);
    } else {
        this.startRoundTimer();
    }
  }

  private checkCollisions() {
    const ball = this.state.ball;
    const p1 = this.state.player1;
    const p2 = this.state.player2;

    // Colisão Esquerda (P1)
    if (ball.x <= 25 && ball.x >= 10 && ball.y >= p1.y && ball.y <= p1.y + p1.height) {
      // Inverte X e garante que vai para direita (positivo)
      this.ballDir.x = Math.abs(this.ballDir.x); 
      this.ballSpeed *= 1.05;
      if (this.ballSpeed > MAX_SPEED) this.ballSpeed = MAX_SPEED;
    }
    else if (p1.shield && ball.x <= 15) {
       this.ballDir.x = Math.abs(this.ballDir.x);
       p1.shield = false; 
    }

    // Colisão Direita (P2)
    const p2X = this.state.tableWidth - 25;
    if (ball.x >= p2X && ball.x <= this.state.tableWidth - 10 && ball.y >= p2.y && ball.y <= p2.y + p2.height) {
      // Inverte X e garante que vai para esquerda (negativo)
        this.ballDir.x = -Math.abs(this.ballDir.x);
        this.ballSpeed *= 1.05;
        if (this.ballSpeed > MAX_SPEED) this.ballSpeed = MAX_SPEED;
        this.checkPowerUpHit(p2);
    }
    else if (p2.shield && ball.x >= this.state.tableWidth - 15) {
       this.ballDir.x = -Math.abs(this.ballDir.x);
       p2.shield = false; 
    }
    
    // PowerUp Collision
    if (this.state.powerUp && this.state.powerUp.active) {
       const dist = Math.hypot(this.state.ball.x - this.state.powerUp.x, this.state.ball.y - this.state.powerUp.y);
       if (dist < 30) { 
          const owner = this.lastHitterId === this.state.player1.id ? this.state.player1 : this.state.player2;
          if (this.lastHitterId) this.activatePowerUp(owner);
       }
    }
  }

  // --- MÉTODOS AUXILIARES ---
  private checkPowerUpHit(player: any) { this.lastHitterId = player.id; }

  private startPowerUpSpawner() {
    if(!this.isBallMoving) return;
    const randomTime = Math.random() * (10000 - 5000) + 5000;
    setTimeout(() => {
        if (!this.state.powerUp && this.isBallMoving) this.spawnPowerUp();
        if (this.isBallMoving) this.startPowerUpSpawner();
    }, randomTime);
  }

  private spawnPowerUp() {
    const types = [PowerUpType.BIG_PADDLE, PowerUpType.SHIELD, PowerUpType.SPEED_BOOST];
    const randomType = types[Math.floor(Math.random() * types.length)];
    // Margens seguras
    const x = 200 + Math.random() * (this.state.tableWidth - 400);
    const y = 100 + Math.random() * (this.state.tableHeight - 200);
    this.state.powerUp = { active: true, x, y, type: randomType };
    setTimeout(() => {
        if (this.state.powerUp && this.state.powerUp.x === x) {
            this.state.powerUp = null;
        }
    }, 6000);
  }

  private activatePowerUp(player: any) {
    if (!this.state.powerUp) return;
    const type = this.state.powerUp.type;
    this.state.powerUp = null;

    if (type === PowerUpType.BIG_PADDLE) {
        player.height = 150;
        setTimeout(() => player.height = 100, 5000);
    } else if (type === PowerUpType.SHIELD) {
        player.shield = true;
    } else if (type === PowerUpType.SPEED_BOOST) {
        this.ballSpeed += 5; // Aumenta muito a velocidade
        setTimeout(() => { this.ballSpeed -= 5; }, 5000);
    }
  }

  private endMatch(winnerId: string) {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    
    // Remove listeners
    const p1Socket = this.io.sockets.sockets.get(this.state.player1.id);
    const p2Socket = this.io.sockets.sockets.get(this.state.player2.id);
    if (p1Socket) p1Socket.removeAllListeners('movePaddle');
    if (p2Socket) p2Socket.removeAllListeners('movePaddle');

    this.io.to([this.state.player1.id, this.state.player2.id]).emit('gameOver', {
        winnerId: winnerId,
        message: winnerId === this.state.player1.id ? 'Tomatoes Win!' : 'Potatoes Win!'
    });
  }
}