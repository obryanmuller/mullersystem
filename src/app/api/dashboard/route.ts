import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tipo para produtos em alerta de estoque
type ProdutoEstoque = {
  id: number;
  nome: string;
  sku: string;
  quantidade: number;
  estoqueMinimo: number;
};

export async function GET() {
  try {
    // --- 1. Dados para os KPIs de Vendas ---
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

    // --- CÁLCULO: Lista de Produtos em Alerta e Esgotados ---
    const todosProdutos = await prisma.produto.findMany({
      select: {
        id: true,
        nome: true,
        sku: true,
        quantidade: true,
        estoqueMinimo: true,
      },
    });

    const lowStockProductsList: ProdutoEstoque[] = [];
    const outOfStockProductsList: ProdutoEstoque[] = [];

    todosProdutos.forEach((produto) => {
      const quantidade = Number(produto.quantidade);
      const limite = Number(produto.estoqueMinimo);

      const produtoFormatado: ProdutoEstoque = {
        id: produto.id,
        nome: produto.nome,
        sku: produto.sku,
        quantidade: quantidade,
        estoqueMinimo: limite,
      };

      if (quantidade === 0) {
        outOfStockProductsList.push(produtoFormatado);
      } else if (quantidade <= limite) {
        lowStockProductsList.push(produtoFormatado);
      }
    });

    // --- 2. Dados de Vendas da Semana ---
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const vendasSemana = await prisma.venda.findMany({
      where: { createdAt: { gte: last7Days } },
      orderBy: { createdAt: 'asc' },
    });

    const vendasPorDia = Array(7).fill(0);
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    vendasSemana.forEach((venda) => {
      const dia = venda.createdAt.getDay();
      vendasPorDia[dia] += Number(venda.total);
    });

    // --- 3. Dados de Formas de Pagamento ---
    const pagamentos = await prisma.venda.groupBy({
      by: ['pagamento'],
      _count: {
        pagamento: true,
      },
    });

    // --- 4. Produtos Mais Vendidos (LIMITADO A 4) ---
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
      take: 4,
    });

    const produtoIds = topProdutos.map((p) => p.produtoId);
    const produtosInfo = await prisma.produto.findMany({
      where: { id: { in: produtoIds } },
      select: { id: true, nome: true },
    });

    const produtosMaisVendidos = topProdutos.map((p) => {
      const info = produtosInfo.find((info) => info.id === p.produtoId);
      return {
        nome: info?.nome || 'Produto Desconhecido',
        vendidos: p._sum.quantidade || 0,
      };
    });

    // --- 5. Top Clientes por Faturamento (LIMITADO A 4) ---
    const topClientes = await prisma.cliente.findMany({
      orderBy: {
        totalCompras: 'desc',
      },
      select: {
        nome: true,
        totalCompras: true,
      },
      take: 4,
    });

    const topClientesSerializable = topClientes.map((c) => ({
      nome: c.nome,
      totalCompras: Number(c.totalCompras),
    }));

    // --- 6. Contas a Receber ---
    const vendasAPrazo = await prisma.venda.findMany({
      where: { pagamento: 'A Prazo' },
      select: { total: true },
    });
    const contasAReceber = vendasAPrazo.reduce((sum, venda) => sum + Number(venda.total), 0);

    // --- KPIs Consolidados ---
    const kpis = {
      faturamentoHoje,
      vendasRealizadas: vendasHoje.length,
      ticketMedio: vendasHoje.length > 0 ? faturamentoHoje / vendasHoje.length : 0,
      contasAReceber: contasAReceber,
    };

    return NextResponse.json({
      kpis,
      vendasSemana: {
        labels: diasDaSemana,
        data: vendasPorDia,
      },
      formasPagamento: pagamentos.map((p) => ({
        nome: p.pagamento,
        count: p._count.pagamento,
      })),
      produtosMaisVendidos,
      lowStockProducts: lowStockProductsList,
      outOfStockProducts: outOfStockProductsList,
      topClientes: topClientesSerializable,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar dados para o dashboard' },
      { status: 500 }
    );
  }
}
