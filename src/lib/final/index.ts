import { MouseManager } from "./core/mouse";
export class Editor {
    canvas: HTMLCanvasElement;
    // api
    canvasApi: any;
    // core
    private mouseManager: MouseManager;
    private keyboardManager: any;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.mouseManager = new MouseManager(canvas);
    }
    distroy() {
        
    }
}
