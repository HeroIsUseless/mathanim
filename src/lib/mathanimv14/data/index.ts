import { vec2, vec3, vec4 } from "gl-matrix";
import { MathAnim } from "..";

export type Node = {
    xy: vec2;
    wh: vec2;
    backgroundColor: vec4;
    children?: Node[];
};

export type Cube = {
    xyz: vec3;
    whl: vec3;
    backgroundColor: vec4;
}

export class Data {
    private mathAnim: MathAnim;
    public stage: Cube[];
    public isInited: boolean;
    constructor(
        mathAnim: MathAnim
    ) {
        let isInited = false;
        this.mathAnim = mathAnim;
        if (this.mathAnim?.canvas) {
            const canvas = this.mathAnim.canvas;
            this.stage = [];
            isInited = true;
        }
        this.isInited = isInited;
    }
}
