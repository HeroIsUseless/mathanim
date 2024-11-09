// 最初的hello world
import { useEffect, useState } from "react";

export function useEngine() {
    useEffect(() => {
        // 教程：https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial
        //获取画布元素
        const canvas = document.querySelector("#glcanvas");
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

        // 定义顶点着色器代码，使用 OpenGL ES 着色语言(GLSL) 编写的程序
        // 它的工作是将输入顶点从原始坐标系转换到 WebGL 使用的裁剪空间坐标系，其中每个轴的坐标范围从 -1.0 到 1.0，并且不考虑纵横比，实际尺寸或任何其他因素
        // 顶点着色器需要对顶点坐标进行必要的转换，在每个顶点基础上进行其他调整或计算，然后通过将其保存在由 GLSL 提供的特殊变量（我们称为 gl_Position）中来返回变换后的顶点
        const vertexShaderCode = `
              attribute vec3 a_position;
   
              void main() {
                  gl_Position = vec4(a_position, 1.0);
              }
          `;

        // 定义片元着色器代码
        const fragmentShaderCode = `
              precision mediump float;
   
              void main() {
                  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
              }
          `;


        // 创建顶点着色器对象
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderCode);
        gl.compileShader(vertexShader);

        // 创建片元着色器对象
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderCode);
        gl.compileShader(fragmentShader);

        // 创建着色器程序对象
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // 获取着色器变量位置
        const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');


        // 创建顶点数据
        const vertices = [
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.5, 0.5, 0.0,
            -0.5, 0.5, 0.0
        ];

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