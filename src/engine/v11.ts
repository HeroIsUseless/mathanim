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
                const node1 = mathAnim.createNode({
                    x: 10,
                    y: 10,
                    backgroundColor: [125, 125, 255, 1]
                });
                const node2 = mathAnim.createNode({
                    x: 120,
                    y: 120,
                    backgroundColor: [125, 125, 255, 1]
                });
                const rootNode = mathAnim.rootNode;
                if (rootNode) {
                    rootNode.children?.push(node1, node2);
                }
            }
        };
    }, []);
}
