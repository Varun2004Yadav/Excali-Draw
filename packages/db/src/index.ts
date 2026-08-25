

import { PrismaClient } from "./generated/prisma/client.js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables before instantiating Prisma Client
const dotenvPath = path.resolve(process.cwd(), '.env');
const rootDotenvPath = path.resolve(process.cwd(), '../../.env');
dotenv.config({ path: dotenvPath });
dotenv.config({ path: rootDotenvPath });

export const prismaClient = new PrismaClient();