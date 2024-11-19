import { vec2, vec4 } from "gl-matrix";

export class Node {
    xy: vec2;
    wh: vec2;
    backgroundColor: vec4;
    children?: Node[];
}