export class State {
    animQueue: {
        beginTime: number;
        duration: number;
        frameCallback: (nowTime: number) => void;
    }[] = [];
}