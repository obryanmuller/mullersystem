const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.movimentacaoCaixa.count();
  console.log('Total de movimentações:', count);
  
  const movimentos = await prisma.movimentacaoCaixa.findMany({
    take: 5,
  });
  console.log('Últimos registros:', movimentos);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
