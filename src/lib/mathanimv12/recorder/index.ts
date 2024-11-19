export class Recorder {
    private recorder: MediaRecorder | null;
    constructor(canvas: HTMLCanvasElement) {
        const stream = canvas.captureStream();
        this.recorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
        const data: Blob[] = [];
        this.recorder.ondataavailable = function (event) {
            if (event.data && event.data.size) {
                data.push(event.data);
            }
        };
        this.recorder.onstop = () => {
            console.log("recorder.onstop");
            const url = URL.createObjectURL(new Blob(data, { type: 'video/mp4' }));
            const video = document.querySelector("video");
            if (video) {
                video.src = url;
            }
        };
    }
    start() {
        if (this.recorder) {
            this.recorder.start();
        }
    }
    stop() {
        if (this.recorder) {
            this.recorder.stop();
        }
    }
}