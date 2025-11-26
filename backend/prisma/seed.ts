// Fix: The error "Module '@prisma/client' has no exported member 'PrismaClient'"
// indicates that the Prisma client has not been generated.
// To fix this, run the following command in the `backend` directory:
// npx prisma generate
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    const adminEmail = 'proyectoseconomicosexclusivos@gmail.com';
    const adminPassword = '102030Abc.@';

    const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!adminUser) {
        console.log('Admin user not found, creating one...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin MiBotPro',
                passwordHash: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log('Admin user created successfully.');
    } else {
        console.log('Admin user already exists.');
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });