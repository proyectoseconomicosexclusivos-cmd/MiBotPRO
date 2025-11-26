// Fix: The error "Module '@prisma/client' has no exported member 'PrismaClient'"
// indicates that the Prisma client has not been generated.
// To fix this, run the following command in the `backend` directory:
// npx prisma generate
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;