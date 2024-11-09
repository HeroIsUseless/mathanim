// 封装一下
import { useEffect, useState } from "react";
const vertexShaderCode = `
// 一个属性值，将会从缓冲中获取数据
attribute vec3 a_position;

void main() {
    // gl_Position 是一个顶点着色器主要设置的变量
    gl_Position = vec4(a_position, 1.0); // 貌似没问题
}
// 可以理解为一个gpu核调用完该main后，
`;

// 定义片元着色器代码
// 作用是计算出当前绘制图元中每个像素的颜色值
const fragmentShaderCode = `
precision mediump float;

void main() {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`;

// 创建顶点数据
const vertices = [
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0
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

        // 获取着色器变量位置
        const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');

        // 创建顶点缓冲区对象
        const vertexBuffer = gl.createBuffer();

        // 绑定缓冲区对象
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        // 将数据写入缓冲区对象
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // 启用顶点属性
        gl.enableVertexAttribArray(positionLocation);

        // 将缓冲区对象绑定到顶点属性上
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // 设置视口
        gl.viewport(0, 0, canvas.width, canvas.height);

        // 清空画布
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 使用着色器
        gl.useProgram(shaderProgram);

        // 绘制图形
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    }, [])
}