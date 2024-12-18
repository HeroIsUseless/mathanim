import { useEffect } from "react";
import { MathAnim } from "../lib/mathanimv9";

export function useEngine() {
    useEffect(() => {
        console.log("useEngine");
        const image = new Image();
        image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
        image.onload = function(e) {
            const mathAnim = new MathAnim('#glcanvas');
            if (mathAnim.isInited) {
                mathAnim.createRectangle({
                    x: 10,
                    y: 10,
                    backgroundColor: [125, 125, 255, 1]
                });
            }
        };
    }, []);
}
