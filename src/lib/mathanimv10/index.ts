import { vec2, vec4 } from "gl-matrix";
import { Create } from "./api/create";
import { Render } from "./render";
import { Data, Node } from "./data";

export class MathAnim {
    public canvas: HTMLCanvasElement | null;
    private data: Data | null;
    private render: Render | null;
    isInited: boolean = false;
    create: Create;
    constructor(id: string) {
        let isInited = false;
        const canvas: HTMLCanvasElement | null = document.querySelector(id);
        if (canvas) {
            this.canvas = canvas;
            this.data = new Data(this);
            this.render = new Render(this);
        } else {
            throw new Error("Canvas not found");
        }
        this.isInited = isInited && this.render?.isInited;
        this.workLoop();
    }

    private workLoop() {
        if (this.isInited) {
            requestAnimationFrame(() => {
                this.render?.draw(this.data?.tree);
                this.workLoop();
            });
        }
    }

    createRectangle(options?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        backgroundColor?: vec4;
    }) {
        const node: Node = {
            xy: vec2.fromValues(options?.x || 0, options?.y || 0),
            wh: vec2.fromValues(options?.width || 100, options?.height || 100),
            backgroundColor: options?.backgroundColor || vec4.fromValues(1, 0, 0, 1),
            children: []
        }
        this.data?.tree?.children?.push(node);
    }

}
