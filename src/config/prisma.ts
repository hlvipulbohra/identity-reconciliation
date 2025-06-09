import { PrismaClient } from '@prisma/client';
// This file initializes and exports a Prisma Client instance for database operations.
const prisma = new PrismaClient();

export default prisma;