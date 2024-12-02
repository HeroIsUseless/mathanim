import { MouseManager } from "./mouse";
import { State } from "./state";
export class Editor {
    canvas: HTMLCanvasElement;
    canvasApi: any;
    state: State;
    private mouseManager: MouseManager;
    private keyboardManager: any;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.mouseManager = new MouseManager(canvas);
        this.state = new State();
    }
    distroy() {
        
    }
    changeToCreateState() {
        this.state.now = 'create';
    }
}
