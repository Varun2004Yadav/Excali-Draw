import {z} from "zod";

export const CreateUserSchema = z.object({
    email: z.string().email().min(3),
    password: z.string().min(1),
    name: z.string().min(1)
})

export const SigninSchema = z.object({
    email: z.string().email().min(3),
    password: z.string().min(1),
})

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20)
})