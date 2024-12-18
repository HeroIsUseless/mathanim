import { vec2, vec4 } from "gl-matrix";
import { MathAnim } from "..";

export type Node = {
    xy: vec2;
    wh: vec2;
    backgroundColor: vec4;
    children?: Node[];
};

export class Data {
    private mathAnim: MathAnim;
    public tree: Node;
    public isInited: boolean;
    constructor(
        mathAnim: MathAnim
    ) {
        let isInited = false;
        this.mathAnim = mathAnim;
        if (this.mathAnim?.canvas) {
            const canvas = this.mathAnim?.canvas;
            this.tree = {
                xy: vec2.fromValues(0, 0),
                wh: vec2.fromValues(canvas.width, canvas.height),
                backgroundColor: vec4.fromValues(0, 0, 1, 1),
                children: [],
            }
        }
        this.isInited = isInited;
    }
}
