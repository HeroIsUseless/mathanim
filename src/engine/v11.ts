import { useEffect } from "react";
import { MathAnim } from "../lib/mathanimv11";

export function useEngine() {
    useEffect(() => {
        const image = new Image();
        image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
        image.onload = function(e) {
            const mathAnim = new MathAnim('#glcanvas');
            console.log('mathAnim.isInited', mathAnim.isInited);
            if (mathAnim.isInited) {
                mathAnim.createRectangle({
                    x: 10,
                    y: 10,
                    backgroundColor: [125, 125, 255, 1]
                });
                mathAnim.createRectangle({
                    x: 120,
                    y: 120,
                    backgroundColor: [125, 125, 255, 1]
                });
            }
        };
    }, []);
}
