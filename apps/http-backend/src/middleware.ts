import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  // Get the token
  let token: string | undefined =
    (req.headers["authorization"] as string) || (req.headers["token"] as string);

  // Remove "Bearer " prefix if present
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  if (!token) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    // @ts-ignore
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Unauthorized" });
  }
}
