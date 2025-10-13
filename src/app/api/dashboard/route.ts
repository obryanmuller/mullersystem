import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // --- 1. Dados para os KPIs ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const vendasHoje = await prisma.venda.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        cliente: true,
      },
    });

    const faturamentoHoje = vendasHoje.reduce((acc, venda) => acc + Number(venda.total), 0);
    const clientesAtendidosIds = new Set(vendasHoje.map(v => v.clienteId).filter(id => id !== null));
    
    const kpis = {
      faturamentoHoje,
      vendasRealizadas: vendasHoje.length,
      clientesAtendidos: clientesAtendidosIds.size,
      ticketMedio: vendasHoje.length > 0 ? faturamentoHoje / vendasHoje.length : 0,
    };

    // --- 2. Dados de Vendas da Semana (Exemplo Simplificado) ---
    // Em um cenário real, isso exigiria uma query mais complexa agrupando por dia.
    // Para simplificar, vamos retornar as vendas dos últimos 7 dias.
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const vendasSemana = await prisma.venda.findMany({
        where: { createdAt: { gte: last7Days } },
        orderBy: { createdAt: 'asc' },
    });

    // Agrupando faturamento por dia da semana
    const vendasPorDia = Array(7).fill(0); // [Dom, Seg, Ter, Qua, Qui, Sex, Sab]
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    vendasSemana.forEach(venda => {
        const dia = venda.createdAt.getDay(); // 0 = Domingo, 1 = Segunda...
        vendasPorDia[dia] += Number(venda.total);
    });

    // --- 3. Dados de Formas de Pagamento ---
    const pagamentos = await prisma.venda.groupBy({
      by: ['pagamento'],
      _count: {
        pagamento: true,
      },
    });

    // --- 4. Produtos Mais Vendidos ---
    const topProdutos = await prisma.itemVenda.groupBy({
        by: ['produtoId'],
        _sum: {
            quantidade: true,
        },
        orderBy: {
            _sum: {
                quantidade: 'desc',
            },
        },
        take: 5,
    });
    
    // Buscar os nomes dos produtos
    const produtoIds = topProdutos.map(p => p.produtoId);
    const produtosInfo = await prisma.produto.findMany({
        where: { id: { in: produtoIds } },
        select: { id: true, nome: true },
    });

    const produtosMaisVendidos = topProdutos.map(p => {
        const info = produtosInfo.find(info => info.id === p.produtoId);
        return {
            nome: info?.nome || 'Produto Desconhecido',
            vendidos: p._sum.quantidade || 0,
        };
    });


    return NextResponse.json({
        kpis,
        vendasSemana: {
            labels: diasDaSemana,
            data: vendasPorDia,
        },
        formasPagamento: pagamentos.map(p => ({
            nome: p.pagamento,
            count: p._count.pagamento,
        })),
        produtosMaisVendidos,
    });

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar dados para o dashboard' }, { status: 500 });
  }
}