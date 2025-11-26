import { RequestHandler } from 'express';
import prisma from '../db';

// Fix: Use RequestHandler type for correct type inference on req and res.
export const getConfigurations: RequestHandler = async (req, res) => {
    try {
        const configurations = await prisma.userConfiguration.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(configurations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching configurations' });
    }
};

// Fix: Use RequestHandler type for correct type inference on req and res.
export const createConfiguration: RequestHandler = async (req, res) => {
    const { templateId, templateTitle, businessName, phone, email, hours, services } = req.body;
    try {
        const newConfig = await prisma.userConfiguration.create({
            data: {
                userId: req.user!.id,
                templateId,
                templateTitle,
                businessName,
                phone,
                email,
                hours,
                services,
            },
        });
        res.status(201).json(newConfig);
    } catch (error) {
        res.status(500).json({ message: 'Error creating configuration' });
    }
};

// Fix: Use RequestHandler type for correct type inference on req and res.
export const updateConfiguration: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const { businessName, phone, email, hours, services } = req.body;
    try {
        const config = await prisma.userConfiguration.findUnique({ where: { id } });
        if (config?.userId !== req.user!.id) {
            return res.status(403).json({ message: 'Not authorized to update this configuration' });
        }

        const updatedConfig = await prisma.userConfiguration.update({
            where: { id },
            data: { businessName, phone, email, hours, services },
        });
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: 'Error updating configuration' });
    }
};

// Fix: Use RequestHandler type for correct type inference on req and res.
export const deleteConfiguration: RequestHandler = async (req, res) => {
    const { id } = req.params;
    try {
        const config = await prisma.userConfiguration.findUnique({ where: { id } });
        if (config?.userId !== req.user!.id) {
            return res.status(403).json({ message: 'Not authorized to delete this configuration' });
        }
        await prisma.userConfiguration.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting configuration' });
    }
};