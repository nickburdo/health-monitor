import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import type { HealthDb } from './health-records';

import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma
  ? globalForPrisma.prisma
  : new PrismaClient({
      adapter,
      log: ['error'],
    });

globalForPrisma.prisma = prisma;

export const healthDb = prisma as unknown as HealthDb;
