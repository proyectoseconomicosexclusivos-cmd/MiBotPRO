import { RequestHandler } from 'express';
import prisma from '../db';

// Fix: Use RequestHandler type for correct type inference on req and res.
export const getSettings: RequestHandler = async (req, res) => {
    try {
        const settings = await prisma.apiSettings.findUnique({
            where: { userId: req.user!.id },
        });
        res.json(settings || {});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

// Fix: Use RequestHandler type for correct type inference on req and res.
export const updateSettings: RequestHandler = async (req, res) => {
    const settingsData = req.body;
    try {
        const updatedSettings = await prisma.apiSettings.upsert({
            where: { userId: req.user!.id },
            update: settingsData,
            create: {
                userId: req.user!.id,
                ...settingsData,
            },
        });
        res.json(updatedSettings);
    } catch (error) {
        console.error("Error updating settings:", error)
        res.status(500).json({ message: 'Error updating settings' });
    }
};