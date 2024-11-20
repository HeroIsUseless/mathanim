import { vec2, vec3, vec4 } from "gl-matrix";
import { Create } from "./api/create";
import { Render } from "./render";
import { Cube, Data, Node } from "./data";
import { State } from "./state";
import { Recorder } from "./recorder";

export class MathAnim {
    public canvas: HTMLCanvasElement | null;
    private data: Data | null;
    private render: Render | null;
    private state: State | null;
    public recorder: Recorder | null;
    isInited: boolean = false;
    create: Create;
    constructor(id: string) {
        let isInited = false;
        const canvas: HTMLCanvasElement | null = document.querySelector(id);
        if (canvas) {
            this.canvas = canvas;
            this.data = new Data(this);
            this.render = new Render(this);
            this.state = new State();
            this.recorder = new Recorder(canvas);
            isInited = true;
        } else {
            throw new Error("Canvas not found");
        }
        this.isInited = isInited && this.data?.isInited && this.render?.isInited;
        if (this.isInited) {
            this.workLoop();
        }
    }

    private workLoop() {
        // 如果你的显示器是 60Hz，requestAnimationFrame() 每秒会回调约 60 次。
        // 如果浏览器窗口被最小化，或者切换到另一个标签页，requestAnimationFrame() 会暂停执行，减少CPU和GPU的负载。
        // 这和 setTimeout、setInterval 不同，它们会一直执行，即使页面不可见。
        // 浏览器会为回调函数传递一个 timestamp 参数，表示当前被请求的动画帧开始时的时间戳。可以用来计算动画进行的时间差。
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
        requestAnimationFrame(() => {
            let ts = Date.now();
            for (let i = 0; i < (this.state?.animQueue?.length || 0); i++) {
                const anim = this.state?.animQueue[i];
                const beginTime = anim?.beginTime || 0;
                const duration = anim?.duration || 0;
                if (beginTime + duration >= ts) {
                    anim?.frameCallback?.(ts);
                }
            }
            this.render?.draw(this.data?.tree);
            if (this.state?.animQueue) {
                this.state.animQueue = this.state?.animQueue.filter((anim) => {
                    const beginTime = anim?.beginTime || 0;
                    const duration = anim?.duration || 0;
                    return beginTime + duration >= ts;
                });
            }
            this.workLoop();
        });
    }

    get rootNode(): Node | undefined {
        return this.data?.tree;
    }

    createNode(options: {
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
        return node;
    }

    createCube(options: {
        xyz?: vec3;
        whl?: vec3;
        backgroundColor?: vec4;
    }) {
        const cube: Cube = {
            xyz: options?.xyz || vec3.fromValues(0, 0, 0),
            whl: options?.whl || vec3.fromValues(1, 1, 1),
            backgroundColor: options?.backgroundColor || vec4.fromValues(1, 0, 0, 1),
            children: []
        }
    }

    moveTo(options: {
        node: Node,
        xy: vec2,
        duration?: number
    }) {
        const node = options.node;
        const endXy = options.xy;
        const duration = options.duration || 0;
        const beginTime = Date.now();
        const beginXy = node.xy;
        this.state?.animQueue.push({
            beginTime,
            duration,
            frameCallback: (nowTime) => {
                const nowXy = vec2.lerp(vec2.create(), beginXy, endXy, (nowTime - beginTime) / duration);
                node.xy = nowXy;
            }
        })
    }

}
