import { NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";


export function middleware(req: Request, res: Response , next : NextFunction) {
//@ts-ignore
    const token = req.headers["authorization"] ?? "";

    const decoded = jwt.verify(token,JWT_SECRET)
    
    if(decoded){
        //@ts-ignore
        req.userId = decoded.userId;
    }else{
        //@ts-ignore
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}