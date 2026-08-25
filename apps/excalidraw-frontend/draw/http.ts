import { HTTP_BACKEND } from "@/config";
import axios from "axios";


export async function getExistingShapes(roomSlug: string) {
  try {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomSlug}`);
    const messages = res.data.messages || [];

    const shapes = messages.map((x: { message: string }) => {
      try {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    return shapes;
  } catch (error) {
    console.warn("Could not load existing shapes, starting with an empty canvas:", error);
    return [];
  }
}
