// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Define o client como uma variável global para reutilização
const prismaClientSingleton = () => {
  // A URL é lida automaticamente do DATABASE_URL no .env
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Cria um objeto global para armazenar a instância do Prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Usa a instância global em desenvolvimento (evita novas conexões a cada hot-reload)
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

// Em produção, a Vercel gerencia as instâncias serverless
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}