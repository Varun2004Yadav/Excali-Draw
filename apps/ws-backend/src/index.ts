import { WebSocketServer, WebSocket } from "ws"
import  jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({port: 8080});

interface User{
    ws: WebSocket,
    rooms: string[],
    userId: string
}
const users : User[] = []; 

function checkUser(token: string) : string | null{
try{
 const decoded = jwt.verify(token,JWT_SECRET);

 if(typeof decoded == "string"){
    return null;
 }

    if(!decoded || !(decoded as JwtPayload).userId){
        return null;
    }
    return decoded.userId;
}catch(e){
    return null;
}
}

wss.on('connection' , function connection(ws,request){
    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token')  || "";
    const userId = checkUser(token)
   
  if (userId == null) { 
    ws.close()
    return null
}

    users.push({
        userId,
        rooms: [],
        ws
    })


    ws.on('message', async function message(data){
       let parseData;
       try {
           if(typeof data !== "string"){
            parseData = JSON.parse(data.toString());
           }else{
            parseData = JSON.parse(data); 
           }
       } catch (error) {
           console.error("Failed to parse WebSocket message:", error);
           return;
       }

       // Validate that parseData has the required type field
       if (!parseData || !parseData.type) {
           console.error("Invalid message format: missing type field");
           return;
       }

        if(parseData.type === "join_room"){
            const user = users.find( x => x.ws === ws);
            if (user && parseData.roomId) {
                user.rooms.push(parseData.roomId);
                console.log(`User ${userId} joined room: ${parseData.roomId}`);
            }
        }

        if(parseData.type == "leave_room"){
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user.rooms.filter(x => x !== parseData.roomId);
            console.log(`User ${userId} left room: ${parseData.roomId}`);
        }

        if(parseData.type === "chat"){
            const roomSlug = parseData.roomId; // This is actually the room slug
            const message = parseData.message;

            // Validate required fields
            if (!roomSlug || !message) {
                console.error("Missing required fields for chat message:", { roomSlug, message });
                return;
            }

            try {
                // First, find the room by slug to get the actual room ID
                const room = await prismaClient.room.findUnique({
                    where: {
                        slug: roomSlug
                    }
                });

                if (!room) {
                    console.error(`Room not found with slug: ${roomSlug}`);
                    return;
                }

                // Create the chat record with the actual numeric room ID
                await prismaClient.chat.create({
                    data: {
                        roomId: room.id,
                        message,
                        userId
                    }
                });

                // Broadcast the message to all users in the room
                users.forEach(user => {
                    if(user.rooms.includes(roomSlug)){
                        user.ws.send(JSON.stringify({
                            type: "chat",
                            message: message,
                            roomId: roomSlug // Send back the slug for frontend consistency
                        }))
                    }
                });
            } catch (error) {
                console.error("Error creating chat:", error);
            }
        }
    });
})
