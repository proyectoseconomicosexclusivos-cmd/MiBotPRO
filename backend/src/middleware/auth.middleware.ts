import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';
// Fix: The error on `Role` indicates that the Prisma client has not been generated.
// Run `npx prisma generate` in the `backend` directory to create the necessary types.
import { Role } from '@prisma/client';

// By declaring this namespace, we are adding the 'user' property to the
// global Express.Request interface. This is the modern, recommended way
// to add custom properties to the request object in a type-safe manner.
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: Role;
            }
        }
    }
}

// Fix: Use RequestHandler type to ensure req, res, and next are correctly typed.
export const protect: RequestHandler = async (req, res, next) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = bearer.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables.");
        return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET) as { id: number, role: Role, iat: number };
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, role: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        
        req.user = user;
        next();
    } catch (e) {
        console.error(e);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};