import { useEffect, useRef, useState } from "react";
import { initDraw } from "@/draw";

export default function Canvas({
    roomId,
    socket
}:{
    socket: WebSocket
    roomId:string
}) {
 const canvasRef = useRef<HTMLCanvasElement>(null);

     useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, roomId, socket);
        }
    }, [canvasRef]);

     return <div>
        <canvas ref={canvasRef} width={700} height={720}></canvas>
    </div>
}