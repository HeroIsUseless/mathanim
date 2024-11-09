// 教程：https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html
import { useEffect, useState } from "react";
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
uniform vec3 u_resolution; // 在一次绘制中对所有顶点保持一致值
// 要注意的是全局变量属于单个着色程序，如果多个着色程序有同名全局变量，需要找到每个全局变量并设置自己的值
varying vec4 v_color;
void main() {
    // 直接把属性值中的数据赋给可变量
    v_color = vec4(a_color, 1.0);
    // 从像素坐标转换到 0.0 到 1.0
    vec3 zeroToOne = a_position / u_resolution;
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
void main() {
    gl_FragColor = v_color;
}
`;

// 创建顶点数据
const vertices = [
    100, 100, 0.0,
    100, 200, 0.0,
    200, 200, 0.0,
    200, 100, 0.0
];

const colors = [
    0.1, 0.2, 0.3,
    0.4, 0.3, 0.2,
    0.3, 0.4, 0.5,
    0.8, 0.2, 0.5
];
// 我们为什么不以GPU代码为主体，CPU代码为客体进行编写呢
// 只能说各有各好处
// GPU与CPU的区别是：
// CPU一套代码+内存数据，一个cpu核心执行一次
// GPU一套代码+显存数据，n个gpu核心执行n次，显存数据是放到一块的
export function useEngine() {

    function initNonengine(id) {
        let shaderProgram;
        function initCanvas() {
            //获取画布元素
            const canvas = document.querySelector(id);
            // 初始化 WebGL 上下文
            const gl = canvas.getContext("webgl"); // 如果绘制2d的，就用"2d"
            return { canvas, gl }
        }

        function loadShader(type, source) {
            //根据着色类型，建立着色器对象
            const shader = gl.createShader(type);
            //将着色器源文件传入着色器对象中
            gl.shaderSource(shader, source);
            //编译着色器对象
            gl.compileShader(shader);
            //返回着色器对象
            return shader;
        }

        function createProgram(vertexShader, fragmentShader) {
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            shaderProgram = program;
            return program;
        }

        function initShaders(vertexShaderCode, fragmentShaderCode) {
            // 创建顶点着色器对象
            const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderCode);
            // 创建片元着色器对象
            const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderCode);
            // 创建着色器程序对象
            const shaderProgram = createProgram(vertexShader, fragmentShader);

            gl.useProgram(shaderProgram);
            return shaderProgram;
        }

        function setBuffer(bufferName, bufferData, bufferOption) {
            // 获取着色器中自定义变量a_position，算是一种引用吧
            const positionLocation = gl.getAttribLocation(shaderProgram, bufferName);
            // gl.createBuffer创建一个缓冲，算是显存里的一个地址引用吧
            const positionBuffer = gl.createBuffer();
            // gl.bindBuffer是设置缓冲为当前使用缓冲，可以理解为只有一个写缓冲锁，即ARRAY_BUFFER
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            // gl.bufferData将数据拷贝到缓冲，即内存数据写入到缓存数据
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
            // 这个命令是告诉WebGL我们想从缓冲中提供数据，可以理解为打开了读权限或者读锁
            gl.enableVertexAttribArray(positionLocation);
            // Vertex Array Object-VAO，VAO是一个对象，其中包含一个或者更多的Vertex Buffer Objects VBO
            // 而VBO是Graphics Card中的一个内存缓冲区，用来保存顶点信息，颜色信息，法线信息，纹理坐标信息和索引信息等等。
            // 相当于瓶子中存放的多个VBO中的数据都出来了，一次性并发送到GPU进行绘制。
            // 采用VBO、VAO节省了绘制多个物体时 CPU 与 GPU 之间的通讯时间，提高了渲染性能。
            // VBO是 CPU 和 GPU 之间传递信息的桥梁，我们把数据存入VBO(这一步在CPU执行)，然后VBO会自动把数据送入GPU。
            // VAO/VBO可以理解为显存数据，VAO=VBOs
            // 因此VAO这里的描述VBO是怎么样的
            gl.vertexAttribPointer( // 这里是设置了一下读取设置
                positionLocation,
                3, // 每次迭代运行提取三个单位数据
                gl.FLOAT, // 每个单位的数据类型是32位浮点型
                false, // 不需要归一化数据
                0, // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                // 每次迭代运行运动多少内存到下一个数据开始点
                0 // 从缓冲起始位置开始读取
            );
        }

        function setUniform(uniformName, uniformOption) {
            const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, uniformName);
            // gl.uniform3f(resolutionUniformLocation, canvas.width, canvas.height, 1.0);   
            gl.uniform3f(resolutionUniformLocation, uniformOption.width, uniformOption.height, 1.0);   
        }

        const { canvas, gl } = initCanvas();
        // 设置视口，将canvas的高度映射为(-1, 1)的区间
        // 原坐标在左下角
        gl.viewport(0, 0, canvas.width, canvas.height);
        // gl.clearColor(0.0, 0.0, 0.0, 0);
        // gl.clear(gl.COLOR_BUFFER_BIT);
        return {
            canvas,
            gl,
            initShaders,
            setBuffer,
            setUniform
        };
    }

    useEffect(() => {
        // 教程：https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial
        const nonengine = initNonengine("#glcanvas");
        const { canvas, gl, initShaders, setBuffer, setUniform } = nonengine;

        initShaders(vertexShaderCode, fragmentShaderCode);
        setBuffer("a_position", vertices);
        setBuffer("a_color", colors);
        setUniform("u_resolution", { width: canvas.width, height: canvas.height });

        // 绘制图形
        gl.drawArrays(
            gl.TRIANGLE_FAN, // 顶点着色器每运行三次WebGL将会根据三个gl_Position值绘制一个三角形
            // 另外每多出一个点，多一个三角形
            0, // offset
            4 // 顶点着色器将运行四次
        );
    }, [])
}