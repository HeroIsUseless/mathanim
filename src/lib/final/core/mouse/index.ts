import { MouseEvents } from "./events";

export class MouseManager {
    events: MouseEvents;
    constructor(canvas: HTMLCanvasElement) {
        this.events = new MouseEvents();
        canvas.addEventListener("click", (event) => {});
        canvas.addEventListener("mousedown", (event) => {});
        canvas.addEventListener("mousemove", (event) => {});
        canvas.addEventListener("mouseup", (event) => {});
    }
}
