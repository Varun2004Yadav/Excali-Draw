import { useState, useEffect } from "react";
import { WS_URL } from "../app/room/[slug]/config";
import { useRouter } from "next/router";

export function useSocket() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return; // Wait until token is available

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };

    ws.onclose = () => {
      setLoading(true);
      setSocket(null);
    };

    return () => {
      ws.close(); // Cleanup on unmount
    };
  }, [token]);

  return { socket, loading };
}
