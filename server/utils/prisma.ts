import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db',
});

export const prisma = globalForPrisma.prisma
  ? globalForPrisma.prisma
  : new PrismaClient({
      adapter,
      log: ['error'],
    });

globalForPrisma.prisma = prisma;
