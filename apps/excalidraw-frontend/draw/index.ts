import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
   {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket : WebSocket ) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if(message.type == "chat") {
        const parsedShape = JSON.parse(message.message)
        existingShapes.push(parsedShape.shape)
        clearCanvas(existingShapes, canvas,ctx);
    }
  }

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  // Set initial black background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  clearCanvas(existingShapes,canvas,ctx);
  let startX = 0;
  let startY = 0;
  let clicked = false;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.offsetX; // ✅ use offsetX / offsetY
    startY = e.offsetY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.offsetX - startX;
    const height = e.offsetY - startY;
    const shape : Shape= {
      type: "rect",
      x: startX,
      y: startY,
      width,
      height,
    }
    existingShapes.push(shape);

    socket.send(JSON.stringify({
        type: "chat",
        message: JSON.stringify({
            shape
        }), 
        roomId
    }))

    
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const width = e.offsetX - startX;
      const height = e.offsetY - startY;

      clearCanvas(existingShapes, canvas, ctx);

      ctx.strokeStyle = "white";
      ctx.strokeRect(startX, startY, width, height);
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  // Clear and reset black background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Redraw saved shapes
  existingShapes.forEach((shape) => {
    if (shape.type === "rect") {
      ctx.strokeStyle = "white";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

async function getExistingShapes(roomId: string){

    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;
   


    const shapes = messages.map((x:{message:string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })
return shapes
}
