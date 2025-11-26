import { RequestHandler } from 'express';
import prisma from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Fix: Use RequestHandler type for correct type inference on req and res.
export const register: RequestHandler = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        // All new registrations are CLIENTs by default
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'CLIENT',
            },
        });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Fix: Use RequestHandler type for correct type inference on req and res.
export const login: RequestHandler = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);

        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};