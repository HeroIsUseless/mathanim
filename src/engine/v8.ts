import { useEffect } from "react";
import { MathAnim } from "../lib/mathanim";

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
// 纹理
uniform sampler2D u_image;
// 从顶点着色器传入的纹理坐标
varying vec2 v_texCoord;
void main() {
    gl_FragColor = v_color; // 看来是专门用来画图的
}
`;

// 创建顶点数据
// 左下，左上，右上，右下
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
    useEffect(() => {
        console.log("useEngine");
        const image = new Image();
        image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
        image.onload = function(e) {
            const mathAnim = new MathAnim('#glcanvas');
            if (mathAnim.isInited) {
                mathAnim.initShaders(vertexShaderCode, fragmentShaderCode);
                mathAnim.setBuffer("a_position", vertices);
                mathAnim.setBuffer("a_color", colors);
                mathAnim.setUniform("u_resolution");
                mathAnim.draw();
            }
        };
    }, []);
}
