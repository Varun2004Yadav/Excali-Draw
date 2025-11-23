import { HTTP_BACKEND } from "@/config";
import axios from "axios";


export async function getExistingShapes(roomSlug: string) {

  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomSlug}`);
  const messages = res.data.messages;



  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message)
    return messageData.shape;
  })
  return shapes
}
