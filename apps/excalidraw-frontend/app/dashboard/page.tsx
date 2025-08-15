"use client"

import { HTTP_BACKEND } from "@/config"
import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("")
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${HTTP_BACKEND}/room`);
        setRooms(res.data.rooms);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  const handleJoinRoom = (slug: string) => {
    router.push(`/canvas/${slug}`);
  };

  const handleCreateRoom = async() => {
    if (!roomName.trim()) {
      setError("Room name is required")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be signed in to create a room");
        setIsCreating(false);
        return;
      }
      
      const { data } = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: roomName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Refresh rooms list after creating
      const res = await axios.get(`${HTTP_BACKEND}/room`);
      setRooms(res.data.rooms);
      setRoomName("");
      setIsCreating(false);
    } catch(error) {
      console.log(error);
      setError("Failed to create room. Please try again.");
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Drawing Dashboard</h1>
          <p className="text-gray-600">Create new rooms or join existing ones to start drawing</p>
        </div>

        {/* Create Room Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Room</h2>
          <div className="space-y-4">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter room name..."
              value={roomName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setRoomName(e.target.value)
                setError("")
              }}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleCreateRoom()}
            />
            <button 
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleCreateRoom} 
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Room"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {/* Available Rooms Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Rooms</h2>
          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No rooms available yet</p>
              <p className="text-sm text-gray-400 mt-1">Create a room to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{room.name || room.slug}</h3>
                    <p className="text-sm text-gray-500">Room ID: {room.slug}</p>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.slug)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Join Room
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


