export declare class Ball {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    baseSpeed: number;
    constructor(canvasWidth: number, canvasHeight: number);
    reset(canvasWidth: number, canvasHeight: number): void;
    update(canvasWidth: number, canvasHeight: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    increaseSpeed(): void;
}
//# sourceMappingURL=ball.d.ts.map