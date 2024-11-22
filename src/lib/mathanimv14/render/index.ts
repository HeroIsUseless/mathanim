import { mat4, vec2, vec4 } from "gl-matrix";
import { MathAnim } from "..";
import { Cube, Node } from "../data";

const vertexShaderCode = `
// 一个属性值，将会从缓冲中获取数据
attribute vec3 a_position; // 从缓冲中获取的数据
// 创建缓冲: var buf = gl.createBuffer();
// 绑定缓冲管道: gl.bindBuffer(gl.ARRAY_BUFFER, buf);
// 将数据存入缓冲: gl.bufferData(gl.ARRAY_BUFFER, someData, gl.STATIC_DRAW);
// 找到属性所在地址：var positionLoc = gl.getAttribLocation(someShaderProgram, "a_position");
// 允许属性获取缓冲：gl.enableVertexAttribArray(positionLoc); // 私下里是用了ARRAY_BUFFER的位置
// 怎么从缓冲中获取数据传递给属性：gl.vertexAttribPointer(positionLoc, numComponents, type, false, stride, offset);
attribute vec3 a_color;
uniform vec3 u_translation; // 平移量，uniform应该指的就是最普通的自定义变量
uniform vec3 u_resolution; // 在一次绘制中对所有顶点保持一致值，或者说，归一化，这是画布的大小
// 要注意的是全局变量属于单个着色程序，如果多个着色程序有同名全局变量，需要找到每个全局变量并设置自己的值
varying vec4 v_color;
// 'varying'的变量将纹理坐标从顶点着色器传到片段着色器
// WebGL会用顶点着色器中值的进行插值，然后传给对应像素执行的片段着色器
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    // 直接把属性值中的数据赋给可变量
    v_color = vec4(a_color, 1.0);
    // 将纹理坐标传给片段着色器
    // GPU会在点之间进行插值
    v_texCoord = a_texCoord;
    // 加上平移量
    vec3 position = a_position + u_translation;
    // 从像素坐标转换到 0.0 到 1.0
    vec3 zeroToOne = position / u_resolution;
    // 再把 0->1 转换 0->2
    vec3 zeroToTwo = zeroToOne * 2.0;
    // 把 0->2 转换到 -1->+1 (裁剪空间)
    vec3 clipSpace = zeroToTwo - 1.0;

    // gl_Position 是一个顶点着色器主要设置的变量
    gl_Position = vec4(clipSpace, 1.0);
    // 你可能注意到矩形在区域左下角，WebGL认为左下角是 0，0 。 
    // 想要像传统二维API那样起点在左上角，我们只需翻转y轴即可。
}
`;

// 定义片元着色器代码
// 作用是计算出当前绘制图元中每个像素的颜色值
const fragmentShaderCode = `
// 在着色器中获取纹理信息，可以先创建一个sampler2D类型全局变量，然后用GLSL方法texture2D 从纹理中提取信息。
precision mediump float;
varying vec4 v_color; // 我们只计算了三个顶点，调用了三次顶点着色器，
// 所以也只计算出了三个颜色值， 但是我们的三角形却有很多颜色，
// 这就是称之为可变量的varying的原因啦！
// 纹理
uniform sampler2D u_image;
// 从顶点着色器传入的纹理坐标
varying vec2 v_texCoord;
void main() {
    gl_FragColor = v_color; // 看来是专门用来画图的
}
`;

export class Render {
    private mathAnim: MathAnim;
    private gl: WebGLRenderingContext | null;
    private shaderProgram: WebGLProgram | null;
    isInited: boolean = false;
    constructor(
        mathAnim: MathAnim
    ) {
        let isInited = false;
        this.mathAnim = mathAnim;
        if (this.mathAnim?.canvas) {
            const canvas = this.mathAnim?.canvas;
            const gl = canvas.getContext("webgl");
            if (gl) {
                this.gl = gl;
                isInited = true;
            } else {
                throw new Error("WebGL not supported");
            }
        }
        this.isInited = isInited;
    }
    draw(stage: Cube[] | undefined) {
        if (stage) {
            for (const cube of stage) {
                this.drawCube(cube);
            }
            // this.drawNodes(tree);
        }
    }

    drawNodes(node: Node) {
        this.drawNode(node);
        if (node.children) {
            for (let child of node.children) {
                this.drawNodes(child);
            }
        }
    }

    drawCube(cube: Cube) {
        
    }

    private drawNode(node: Node) {
        const x = node.xy[0] || 0;
        const y = node.xy[1] || 0;
        const width = node.wh[0] || 100;
        const height = node.wh[1] || 100;
        // y轴旋转45度
        const m = mat4.create();
        mat4.rotate(m, m, Math.PI / 4, [0, 1, 1]);
        // 坐标系在左下
        // 左下，左上，右上，右下
        const vertices = [
            x, y, 0.0,
            x, y + height, 0.0,
            x + width, y + height, 0.0,
            x + width, y, 0.0
        ];
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            const newVec4 = vec4.create();
            vec4.transformMat4(newVec4, [x, y, z, 1], m);
            vertices[i] = newVec4[0];
            vertices[i + 1] = newVec4[1];
            vertices[i + 2] = newVec4[2];
        }
        let red = 1;
        let green = 0;
        let blue = 0;
        if (node.backgroundColor) {
            const total = node.backgroundColor[0] + node.backgroundColor[1] + node.backgroundColor[2];
            red = node.backgroundColor[0] / total;
            green = node.backgroundColor[1] / total;
            blue = node.backgroundColor[2] / total;
        }
        const colors = [
            red, green, blue,
            red, green, blue,
            red, green, blue,
            red, green, blue
        ];
        this.initShaders(vertexShaderCode, fragmentShaderCode);
        this.setBuffer("a_position", vertices);
        this.setTransform("u_translation", [10, 20, 30]);
        this.setBuffer("a_color", colors);
        this.setUniform("u_resolution");
        this.render();
    }

    initShaders(vertexShaderCode: string, fragmentShaderCode: string) {
        let shaderProgram: WebGLProgram | null = null;
        if (this.gl) {
            // 创建顶点着色器对象
            const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vertexShaderCode);
            // 创建片元着色器对象
            const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fragmentShaderCode);
            if (vertexShader && fragmentShader) {
                // 创建着色器程序对象
                shaderProgram = this.createProgram(vertexShader, fragmentShader);
                this.gl.useProgram(shaderProgram);
            }
        }
        return shaderProgram;
    }

    loadShader(type: number, source: string) {
        let shader: WebGLShader | null = null;
        if (this.gl) {
            //根据着色类型，建立着色器对象
            shader = this.gl.createShader(type);
            if (shader) {
                //将着色器源文件传入着色器对象中
                this.gl.shaderSource(shader, source);
                //编译着色器对象
                this.gl.compileShader(shader);
            }
        }
        //返回着色器对象
        return shader;
    }

    createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        let program: WebGLProgram | null = null;
        if (this.gl) {
            program = this.gl.createProgram();
            if (program) {
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                this.shaderProgram = program;
            }
        }
        return program;
    }

    setBuffer(bufferName: string, bufferData: number[]) {
        if (this.gl && this.shaderProgram) {
            // 获取着色器中自定义变量a_position，算是一种引用吧
            const attribLocation = this.gl.getAttribLocation(this.shaderProgram, bufferName);
            // gl.createBuffer创建一个缓冲，算是显存里的一个地址引用吧
            const buffer = this.gl.createBuffer();
            // gl.bindBuffer是设置缓冲为当前使用缓冲，可以理解为只有一个写缓冲锁，即ARRAY_BUFFER，无法对一个buffer同时写多次
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            // gl.bufferData将数据拷贝到缓冲，即内存数据写入到缓存数据
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.STATIC_DRAW);
            // 这个命令是告诉WebGL我们想从缓冲中提供数据，可以理解为打开了读权限或者读锁
            this.gl.enableVertexAttribArray(attribLocation);
            // Vertex Array Object-VAO，VAO是一个对象，其中包含一个或者更多的Vertex Buffer Objects VBO
            // 而VBO是Graphics Card中的一个内存缓冲区，用来保存顶点信息，颜色信息，法线信息，纹理坐标信息和索引信息等等。
            // 相当于瓶子中存放的多个VBO中的数据都出来了，一次性并发送到GPU进行绘制。
            // 采用VBO、VAO节省了绘制多个物体时 CPU 与 GPU 之间的通讯时间，提高了渲染性能。
            // VBO是 CPU 和 GPU 之间传递信息的桥梁，我们把数据存入VBO(这一步在CPU执行)，然后VBO会自动把数据送入GPU。
            // VAO/VBO可以理解为显存数据，VAO=VBOs
            // 因此VAO这里的描述VBO是怎么样的
            this.gl.vertexAttribPointer( // 这里是设置了一下读取设置
                attribLocation,
                3, // 每次迭代运行提取三个单位数据
                this.gl.FLOAT, // 每个单位的数据类型是32位浮点型
                false, // 不需要归一化数据
                0, // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                // 每次迭代运行运动多少内存到下一个数据开始点
                0 // 从缓冲起始位置开始读取
            );
        }
    }

    setUniform(uniformName: string) {
        if (this.gl && this.shaderProgram && this.mathAnim?.canvas) {
            const resolutionUniformLocation = this.gl.getUniformLocation(this.shaderProgram, uniformName);
            this.gl.uniform3f(resolutionUniformLocation, this.mathAnim?.canvas.width, this.mathAnim?.canvas.height, 500.0);   
        }
    }

    setTransform(transformName: string, bufferData: number[]) {
        if (this.gl && this.shaderProgram) {
            const transformUniformLocation = this.gl.getUniformLocation(this.shaderProgram, transformName);
            this.gl.uniform3f(transformUniformLocation, bufferData[0], bufferData[1], bufferData[2]);   
        }
    }

    render() {
        if (this.gl) {
            this.gl.drawArrays(
                this.gl.TRIANGLE_FAN, // 顶点着色器每运行三次WebGL将会根据三个gl_Position值绘制一个三角形
                // 另外每多出一个点，多一个三角形
                0, // offset
                4 // 顶点着色器将运行四次
            );
        }
    }
}
