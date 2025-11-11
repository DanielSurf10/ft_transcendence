import { Ball } from './ball';
import { Paddle } from './paddle';
export declare class CollisionSystem {
    static checkWallCollision(ball: Ball, canvasHeight: number): void;
    static checkPaddleCollision(ball: Ball, paddle: Paddle): boolean;
    private static handlePaddleBounce;
    static checkScore(ball: Ball, canvasWidth: number): number;
}
//# sourceMappingURL=collision.d.ts.map