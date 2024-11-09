// 教程：https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html
import { useEffect, useState } from "react";
const vertexShaderCode = `
// 一个属性值，将会从缓冲中获取数据
attribute vec3 a_position;
attribute vec3 a_color;
uniform vec3 u_resolution;
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

export function useEngine() {

    function initNonengine(id) {
        //获取画布元素
        const canvas = document.querySelector(id);
        // 初始化 WebGL 上下文
        const gl = canvas.getContext("webgl"); // 如果绘制2d的，就用"2d"
        // 确认 WebGL 支持性
        if (!gl) {
            alert("无法初始化 WebGL，你的浏览器、操作系统或硬件等可能不支持 WebGL。");
            return;
        }
        // 使用完全不透明的黑色清除所有图像
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 用上面指定的颜色清除缓冲区
        gl.clear(gl.COLOR_BUFFER_BIT);
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
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            return shaderProgram;
        }
        function initShaders(vertexShaderCode, fragmentShaderCode) {
            // 创建顶点着色器对象
            const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderCode);
            // 创建片元着色器对象
            const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderCode);
            // 创建着色器程序对象
            const shaderProgram = createProgram(vertexShader, fragmentShader);
            return shaderProgram;
        }
        return {
            canvas,
            gl,
            initShaders
        };
    }

    useEffect(() => {
        // 教程：https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial
        const nonengine = initNonengine("#glcanvas");
        const { canvas, gl } = nonengine;
        const shaderProgram = nonengine.initShaders(vertexShaderCode, fragmentShaderCode);
        const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
        const colorLocation = gl.getAttribLocation(shaderProgram, "a_color");
        // gl.createBuffer创建一个缓冲
        const positionBuffer = gl.createBuffer();
        // gl.bindBuffer是设置缓冲为当前使用缓冲，可以理解为缓冲舞台只有一个，即ARRAY_BUFFER
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // gl.bufferData将数据拷贝到缓冲
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        // 这个命令是告诉WebGL我们想从缓冲中提供数据
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // bind的是舞台里的数据，而不是舞台本身
        gl.vertexAttribPointer( // 这里是设置了一下读取设置
            positionLocation,
            3, // 每次迭代运行提取三个单位数据
            gl.FLOAT, // 每个单位的数据类型是32位浮点型
            false, // 不需要归一化数据
            0, // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
            // 每次迭代运行运动多少内存到下一个数据开始点
            0 // 从缓冲起始位置开始读取
        );
        // 如果每个类型的数据都用一个缓冲存储，stride 和 offset 都是 0 。例如colors，positions
        // 如果合在一起，那么每次拿6个数据，偏移是3，stride是几？

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(shaderProgram);

        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(
            colorLocation, 
            3, // 每次迭代运行提取三个单位数据，单位个数永远是 1 到 4 之间
            gl.FLOAT, // 每个单位的数据类型是32位浮点型
            false, // 不需要归一化数据
            0, // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
            // 每次迭代运行运动多少内存到下一个数据开始点
            0 // 从缓冲起始位置开始读取
        );

        const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
        gl.uniform3f(resolutionUniformLocation, canvas.width, canvas.height, 1.0);
        gl.clearColor(0.0, 0.0, 0.0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        // 绘制图形
        gl.drawArrays(
            gl.TRIANGLE_FAN, // 顶点着色器每运行三次WebGL将会根据三个gl_Position值绘制一个三角形
            // 另外每多出一个点，多一个三角形
            0, // offset
            4 // 顶点着色器将运行四次
        );
    }, [])
}