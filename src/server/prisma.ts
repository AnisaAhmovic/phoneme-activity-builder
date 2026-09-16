import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  phonemeBuilderPrisma?: PrismaClient;
};

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.phonemeBuilderPrisma) {
    return globalForPrisma.phonemeBuilderPrisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  globalForPrisma.phonemeBuilderPrisma = prisma;

  return prisma;
}
