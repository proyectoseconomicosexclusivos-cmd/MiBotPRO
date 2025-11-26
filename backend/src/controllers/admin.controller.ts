import { RequestHandler } from 'express';
import prisma from '../db';
import { BOT_PRICES } from '../constants';

// Fix: Use RequestHandler type for correct type inference on req and res.
export const getStats: RequestHandler = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({
            where: { role: 'CLIENT' },
        });

        const totalConfigs = await prisma.userConfiguration.count();

        const activeConfigs = await prisma.userConfiguration.findMany({
            where: {
                status: {
                    in: ['active', 'processing'],
                },
            },
        });
        
        const totalRevenue = activeConfigs.reduce((sum, config) => {
            const price = BOT_PRICES[config.templateId] || 0;
            return sum + price;
        }, 0);

        res.json({
            totalUsers,
            totalConfigs,
            totalRevenue,
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// Fix: Use RequestHandler type for correct type inference on req and res.
export const getAllConfigurations: RequestHandler = async (req, res) => {
    try {
        const configurations = await prisma.userConfiguration.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.json(configurations);
    } catch (error) {
        console.error("Error fetching all configurations:", error);
        res.status(500).json({ message: 'Error fetching configurations' });
    }
};