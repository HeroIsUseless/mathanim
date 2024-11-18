import { Create } from "./api/create";

export class MathAnim {
    private canvas: HTMLCanvasElement | null;
    private gl: WebGLRenderingContext | null;
    private shaderProgram: WebGLProgram | null;
    isInited: boolean = false;
    create: Create;
    constructor(id: string) {
        let isInited = false;
        const canvas: HTMLCanvasElement | null = document.querySelector(id);
        if (canvas) {
            this.canvas = canvas;
            const gl = canvas.getContext("webgl");
            if (gl) {
                this.gl = gl;
                isInited = true;
            } else {
                throw new Error("WebGL not supported");
            }
        } else {
            throw new Error("Canvas not found");
        }
        this.isInited = isInited;
        console.log('init mathanim', isInited);
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
            const positionLocation = this.gl.getAttribLocation(this.shaderProgram, bufferName);
            // gl.createBuffer创建一个缓冲，算是显存里的一个地址引用吧
            const positionBuffer = this.gl.createBuffer();
            // gl.bindBuffer是设置缓冲为当前使用缓冲，可以理解为只有一个写缓冲锁，即ARRAY_BUFFER，无法对一个buffer同时写多次
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
            // gl.bufferData将数据拷贝到缓冲，即内存数据写入到缓存数据
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.STATIC_DRAW);
            // 这个命令是告诉WebGL我们想从缓冲中提供数据，可以理解为打开了读权限或者读锁
            this.gl.enableVertexAttribArray(positionLocation);
            // Vertex Array Object-VAO，VAO是一个对象，其中包含一个或者更多的Vertex Buffer Objects VBO
            // 而VBO是Graphics Card中的一个内存缓冲区，用来保存顶点信息，颜色信息，法线信息，纹理坐标信息和索引信息等等。
            // 相当于瓶子中存放的多个VBO中的数据都出来了，一次性并发送到GPU进行绘制。
            // 采用VBO、VAO节省了绘制多个物体时 CPU 与 GPU 之间的通讯时间，提高了渲染性能。
            // VBO是 CPU 和 GPU 之间传递信息的桥梁，我们把数据存入VBO(这一步在CPU执行)，然后VBO会自动把数据送入GPU。
            // VAO/VBO可以理解为显存数据，VAO=VBOs
            // 因此VAO这里的描述VBO是怎么样的
            this.gl.vertexAttribPointer( // 这里是设置了一下读取设置
                positionLocation,
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
        if (this.gl && this.shaderProgram && this.canvas) {
            const resolutionUniformLocation = this.gl.getUniformLocation(this.shaderProgram, uniformName);
            // gl.uniform3f(resolutionUniformLocation, canvas.width, canvas.height, 1.0);   
            this.gl.uniform3f(resolutionUniformLocation, this.canvas.width, this.canvas.height, 1.0);   
        }
    }

    draw() {
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
