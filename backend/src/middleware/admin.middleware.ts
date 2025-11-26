import { RequestHandler } from 'express';
import prisma from '../db';

// Fix: Use RequestHandler type to ensure req, res, and next are correctly typed.
export const isAdmin: RequestHandler = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (user && user.role === 'ADMIN') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Admins only' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while checking admin status' });
    }
};