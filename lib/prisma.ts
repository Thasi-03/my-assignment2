import { PrismaClient } from "@prisma/client";

const g = global as unknown as { prisma?: PrismaClient };

// Reuse Prisma client across hot reloads in development
export const prisma = g.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") g.prisma = prisma;

// ✅ Add this line to support default import in route files
export default prisma;
