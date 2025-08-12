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
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }
try{
   const user = await prismaClient.user.create({
        data:{
        email: parseData.data?.username,
        password: parseData.data.password,
        name: parseData.data.name,
        }
        
    })

    res.json({
        userId: user.id
    })
}catch(e){
    res.status(411).json({
        message: "User already exist with this username and password"
    })
}
})

app.post('/signin', async (req, res) => {

    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
          email : parsedData.data.username,
          password: parsedData.data.password
        }
    })

    if(!user){
        res.status(403).json({
            message: "Not Authorized"
        })
        return
    }

    const token = jwt.sign({
        userId : user?.id
    },JWT_SECRET) 
    
    res.json({
        token
    })
})

//@ts-ignore
app.post('/room',middleware, async (req,res) => {

const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }
//@ts-ignore
    const userId = req.userId;
try{ 
    const room = await prismaClient.room.create({
        data: {
            slug: parsedData.data.name,
            adminId: userId
        }
    })


    res.json({
        roomId: room.id
    })
}catch(e){
    res.status(403).json({
        message: "room Already exist with this  name"
    })
}
})

app.get("/chats/:roomId", async (req,res)=> {

    try{
    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    })
     
     res.json({ messages });
}catch(err){

        console.error("Error fetching chats:", err);
        res.status(500).json({ error: "Internal server error" });
}
})

app.get("/room/:slug", async (req,res)=> {
    const slug = Number(req.params.slug);
    const room = await prismaClient.room.findFirst({
        where: {
            slug :String(slug)
        }
    })
    res.json({
        room
    })
})

app.listen(3001, () => {
    console.log("Listening at port 3001");
})