import { Create } from "./api/create";

export class MathAnim {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    create: Create;
    constructor(canvas: ) {
        let isInited = false;
        const canvas = document.querySelector(id);
        if (canvas) {
            this.canvas = canvas;
        }
        this.gl = canvas.getContext("webgl");
        this.create = new Create(this);
    }
}
