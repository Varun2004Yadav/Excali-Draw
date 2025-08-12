

import { RoomCanvas } from "@/app/components/RoomCanvas";

export async function CanvasPage({params}: {
    params: {
        roomId: string 
    }
}) {
    const roomId = (await params).roomId;
    console.log(roomId);

    return <RoomCanvas roomId = {roomId}/>
}