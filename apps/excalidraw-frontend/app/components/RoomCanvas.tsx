"use client"
import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import  Canvas  from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
   
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYTIwMGRjMy0xOTc3LTQzYzktYjllNi1hNTNjMjVlYjY2YzEiLCJpYXQiOjE3NTUwMDM4MDd9.1ZdCJrXTGguYR_MvZAbgg_xvjVhxZ2XHwcfmL_zUF08`)
        
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    }, [])


    if (!socket) {
        return <div>
            Connecting to server.......
        </div>
    }

    return <div>
        <Canvas roomId= {roomId} socket={socket}/>
    </div>
}