import { Ball } from './ball';
export declare class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    score: number;
    isAI: boolean;
    constructor(x: number, canvasHeight: number, isAI?: boolean);
    update(canvasHeight: number, ball?: Ball): void;
    private aiMove;
    moveUp(): void;
    moveDown(): void;
    draw(ctx: CanvasRenderingContext2D): void;
    reset(canvasHeight: number): void;
}
//# sourceMappingURL=paddle.d.ts.map