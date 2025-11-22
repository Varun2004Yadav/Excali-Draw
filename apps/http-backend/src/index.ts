// Load environment variables BEFORE any other imports
// Using require() ensures this executes synchronously before ES6 imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

import express from "express"
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {CreateUserSchema, SigninSchema, CreateRoomSchema} from "@repo/common/types"
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());


app.post('/signup',async (req,res) => {
    const parseData = CreateUserSchema.safeParse(req.body);
    if(!parseData.success){
        res.status(400).json({
            message: "Incorrect Inputs",
            errors: parseData.error.issues
        });
        return;
    }
    
    try{
        const user = await prismaClient.user.create({
            data:{
                email: parseData.data.email,
                password: parseData.data.password,
                name: parseData.data.name,
            }
        });

        res.json({
            userId: user.id
        });
    } catch(e: any) {
        if (e.code === 'P2002') {
            res.status(409).json({
                message: "User already exists with this email"
            });
        } else {
            console.error("Error creating user:", e);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
})

app.post('/signin', async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message: "Incorrect Inputs",
            errors: parsedData.error.issues
        });
        return;
    }

    try {
        const user = await prismaClient.user.findFirst({
            where: {
                email : parsedData.data.email,
                password: parsedData.data.password
            }
        });

        if(!user){
            res.status(401).json({
                message: "Invalid email or password"
            });
            return;
        }

        const token = jwt.sign({
            userId : user.id
        }, JWT_SECRET); 
        
        res.json({
            token
        });
    } catch (e) {
        console.error("Error during signin:", e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})

//@ts-ignore
app.post('/room',middleware, async (req,res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message: "Incorrect Inputs"
        });
        return;
    }
    
    console.log("Request body:", req.body);
    //@ts-ignore
    const userId = req.userId;
    console.log("User ID:", userId);

    try{ 
        // Generate a slug from the room name
        const slug = parsedData.data.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        const room = await prismaClient.room.create({
            data: {
                slug: slug,
                adminId: userId
            }
        });

        res.json({
            roomId: room.id,
            slug: room.slug,
            name: parsedData.data.name
        });
    } catch(e: any) {
        if (e.code === 'P2002') {
            res.status(409).json({
                message: "Room already exists with this name"
            });
        } else {
            console.error("Error creating room:", e);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
})

app.get("/chats/:roomId", async (req,res)=> {
    try {
        const roomSlug = req.params.roomId; 
        
        // First, find the room by slug to get the actual room ID
        const room = await prismaClient.room.findUnique({
            where: {
                slug: roomSlug
            }
        });

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Now fetch chats using the actual numeric room ID
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: room.id
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        });
     
        res.json({ messages });
    } catch(err) {
        console.error("Error fetching chats:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})

app.get("/room/:slug", async (req,res)=> {
    try {
        const slug = req.params.slug;
        const room = await prismaClient.room.findUnique({
            where: {
                slug: slug
            }
        });
        
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        res.json({
            room
        });
    } catch (e) {
        console.error("Error fetching room:", e);
        res.status(500).json({ error: "Internal server error" });
    }
})

app.get("/room", async (req, res) => {
    try {
        const rooms = await prismaClient.room.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ rooms });
    } catch (e) {
        console.error("Error fetching rooms:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3001, () => {
    console.log("Listening at port 3001");
})