// 学习每行代码的必要性
// 教程：https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html
import { useEffect, useState } from "react";
const vertexShaderCode = `
// 一个属性值，将会从缓冲中获取数据
attribute vec3 a_position;
uniform vec3 u_resolution;
void main() {
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
uniform vec4 u_color;
void main() {
    gl_FragColor = u_color;
}
`;

// 创建顶点数据
const vertices = [
    100, 100, 0.0,
    100, 200, 0.0,
    200, 200, 0.0,
    200, 100, 0.0
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

        // 创建顶点缓冲区对象，属性值从缓冲中获取数据，所以我们创建一个缓冲
        // 可以理解为开辟了一个显存里的空间，cpu和gpu是隔离的很开的
        const vertexBuffer = gl.createBuffer();

        // 绑定缓冲区对象
        // WebGL可以通过绑定点操控全局范围内的许多数据，你可以把绑定点想象成一个WebGL内部的全局变量。
        // 首先绑定一个数据源到绑定点，然后可以引用绑定点指向该数据源。
        // 可以理解为内存中的数据无法直接拷贝到显存上，需要一个入口，没必要，太繁琐了吧
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        // 将数据写入缓冲区对象，现在我们需要通过绑定点向缓冲中存放数据
        // WebGL需要强类型数据，所以new Float32Array(positions)创建了32位浮点型数据序列
        // gl.bufferData复制这些数据到GPU的vertexBuffer对象上
        // 因为在前一步中我们我们将它绑定到了ARRAY_BUFFER（也就是绑定点）上
        // gl.STATIC_DRAW提示WebGL我们不会经常改变这些数据，WebGL会根据提示做出一些优化
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // 在此之上的代码是 初始化代码。这些代码在页面加载时只会运行一次。 
        // 接下来的代码是渲染代码，而这些代码将在我们每次要渲染或者绘制时执行。

        // 获取着色器变量位置
        // GLSL着色程序的唯一输入是一个属性值a_position，这是一个很普通的值/位置
        // 我们要做的第一件事就是从刚才创建的GLSL着色程序中找到这个属性值所在的位置
        const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
        const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
        const colorUniformLocation = gl.getUniformLocation(shaderProgram, "u_color");
        // 启用顶点属性，我们需要告诉WebGL怎么从我们之前准备的缓冲中获取数据给着色器中的属性
        // 我们指定的值绑定到全局VertexAttribArray
        // 不太懂什么意思了？
        gl.enableVertexAttribArray(positionLocation);

        // 将缓冲区对象绑定到顶点属性上，指定从缓冲中读取数据的方式
        gl.vertexAttribPointer(
            positionLocation,
            3, // 每次迭代运行提取三个单位数据
            gl.FLOAT, // 每个单位的数据类型是32位浮点型
            false, // 不需要归一化数据
            0, // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
            // 每次迭代运行运动多少内存到下一个数据开始点
            0 // 从缓冲起始位置开始读取
        );
        // 一个隐藏信息是gl.vertexAttribPointer是将属性绑定到当前的ARRAY_BUFFER。 
        // 换句话说就是属性绑定到了vertexBuffer上。
        // 这也意味着现在利用绑定点随意将 ARRAY_BUFFER绑定到其它数据上后，
        // 该属性依然从vertexBuffer上读取数据。

        // 设置视口
        // 我们需要告诉WebGL怎样把提供的gl_Position裁剪空间坐标对应到画布像素坐标， 
        // 通常我们也把画布像素坐标叫做屏幕空间。
        // 为了实现这个目的，我们只需要调用gl.viewport 方法并传递画布的当前尺寸。
        // 这样就告诉WebGL裁剪空间的 -1 -> +1 分别对应到x轴的 0 -> gl.canvas.width 和y轴的 0 -> gl.canvas.height。
        gl.viewport(0, 0, canvas.width, canvas.height);
        // 清空画布
        // 我们用0, 0, 0, 0清空画布，分别对应 r, g, b, alpha （红，绿，蓝，阿尔法）值， 所以在这个例子中我们让画布变透明了。
        gl.clearColor(0.0, 0.0, 0.0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 使用着色器
        gl.useProgram(shaderProgram);

        // // 设置全局变量 分辨率，必须在gl.useProgram(shaderProgram);下
        gl.uniform3f(resolutionUniformLocation, canvas.width, canvas.height, 1.0);
        // 绘制图形
        gl.drawArrays(
            gl.TRIANGLE_FAN, // 顶点着色器每运行三次WebGL将会根据三个gl_Position值绘制一个三角形
            // 另外每多出一个点，多一个三角形
            0, // offset
            4 // 顶点着色器将运行四次
        );

        // 绘制50个随机颜色矩形
        for (var ii = 0; ii < 50; ++ii) {
            // 创建一个随机矩形
            // 并将写入位置缓冲
            // 因为位置缓冲是我们绑定在
            // `ARRAY_BUFFER`绑定点上的最后一个缓冲
            setRectangle(
                gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

            // 设置一个随机颜色
            gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

            // 绘制矩形
            gl.drawArrays(
                gl.TRIANGLE_FAN, // 顶点着色器每运行三次WebGL将会根据三个gl_Position值绘制一个三角形
                // 另外每多出一个点，多一个三角形
                0, // offset
                4 // 顶点着色器将运行四次
            );
        }
        // 返回 0 到 range 范围内的随机整数
        function randomInt(range) {
            return Math.floor(Math.random() * range);
        }
        // 用参数生成矩形顶点并写进缓冲

        function setRectangle(gl, x, y, width, height) {
            var x1 = x;
            var x2 = x + width;
            var y2 = y + height;
            var y1 = y;

            // 注意: gl.bufferData(gl.ARRAY_BUFFER, ...) 将会影响到
            // 当前绑定点`ARRAY_BUFFER`的绑定缓冲
            // 目前我们只有一个缓冲，如果我们有多个缓冲
            // 我们需要先将所需缓冲绑定到`ARRAY_BUFFER`

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x1, y1, 0.0,
                x2, y1, 0.0,
                x2, y2, 0.0,
                x1, y2, 0.0]), gl.STATIC_DRAW);
        }
        // 不论我们的画布大小是多少，在裁剪空间中每个方向的坐标范围都是 -1 到 1 。
        // 我们的片段着色器只是简单设置gl_FragColor为1, 0, 0.5, 1，
        // 由于画布的每个通道宽度为8位，这表示WebGL最终在画布上绘制颜色[255, 0, 127, 255]。
        // 顶点着色器只是简单的传递了位置信息。 由于位置数据坐标就是裁剪空间中的坐标，所以顶点着色器没有做什么特别的事。
        // 如果你想做三维渲染，你需要提供合适的着色器将三维坐标转换到裁剪空间坐标，因为WebGL只是一个光栅化API。
        // 而不会给你搞进深什么的。
    }, [])
}