// obryanmuller/mullersystem/mullersystem-72aa8aafde1da53f599f9c5c84aac0698a9390fe/src/app/api/vendas/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';

// GET: Busca o histórico de vendas com paginação e filtro
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de Paginação e Busca
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10); // 10 itens por página como padrão
    const searchTerm = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Constrói a cláusula WHERE para busca (nome do cliente ou ID da venda)
    let whereClause: any = {};
    if (searchTerm) {
        // Tenta converter para número para buscar por ID
        const searchId = parseInt(searchTerm, 10);
        
        // Verifica se é uma busca por ID
        if (!isNaN(searchId)) {
            whereClause = { id: searchId };
        } else {
            // Busca por nome do cliente
            whereClause = {
                cliente: {
                    nome: {
                        contains: searchTerm,
                        mode: 'insensitive', // Permite busca sem case-sensitive
                    }
                }
            };
        }
    }

    // 1. Obter o total de vendas filtradas (para calcular o total de páginas)
    const totalVendas = await prisma.venda.count({ where: whereClause });

    // 2. Obter as vendas paginadas e filtradas
    const vendas = await prisma.venda.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit,
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    const serializableVendas = vendas.map(venda => {
      let clienteData = null;
      if (venda.cliente) {
        clienteData = {
          ...venda.cliente,
          // Descriptografa o CPF para exibição
          cpf: decrypt(venda.cliente.cpf),
          totalCompras: Number(venda.cliente.totalCompras),
        };
      }
      
      return {
        ...venda,
        total: Number(venda.total),
        cliente: clienteData,
        itens: venda.itens.map(item => ({
          ...item,
          preco: Number(item.preco),
          produto: {
            nome: item.produto.nome,
            sku: item.produto.sku,
            preco: Number(item.produto.preco),
          },
        })),
      };
    });

    // Retorna os dados, a página atual e o total de vendas
    return NextResponse.json({
        data: serializableVendas,
        currentPage: page,
        totalPages: Math.ceil(totalVendas / limit),
        totalVendas: totalVendas,
        limit: limit,
    });

  } catch (error) {
    console.error('Erro ao buscar histórico de vendas:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico de vendas' }, { status: 500 });
  }
}

// POST: Rota para registrar novas vendas (mantida)
export async function POST(request: NextRequest) {
  try {
    const { total, pagamento, clienteId, itens } = await request.json();

    if (!total || !pagamento || !itens || itens.length === 0) {
      return NextResponse.json({ error: 'Dados da venda incompletos.' }, { status: 400 });
    }

    const vendaRegistrada = await prisma.$transaction(async (tx) => {
      const venda = await tx.venda.create({
        data: {
          total,
          pagamento,
          clienteId,
        },
      });

      for (const item of itens) {
        await tx.itemVenda.create({
          data: {
            vendaId: venda.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            preco: item.preco,
          },
        });

        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidade: {
              decrement: item.quantidade,
            },
          },
        });
      }

      if (clienteId) {
        await tx.cliente.update({
          where: { id: clienteId },
          data: {
            totalCompras: {
              increment: total,
            },
          },
        });
      }

      return tx.venda.findUnique({
        where: { id: venda.id },
        include: {
          itens: { include: { produto: true } },
          cliente: true,
        },
      });
    });

    let clienteFinal = null;
    if (vendaRegistrada?.cliente) {
      clienteFinal = {
        ...vendaRegistrada.cliente,
        totalCompras: Number(vendaRegistrada.cliente.totalCompras),
        cpf: decrypt(vendaRegistrada.cliente.cpf),
      };
    }

    const serializableVenda = {
      ...vendaRegistrada,
      total: Number(vendaRegistrada?.total),
      cliente: clienteFinal,
      itens: vendaRegistrada?.itens.map((item) => ({
        ...item,
        preco: Number(item.preco),
        produto: { ...item.produto, preco: Number(item.produto.preco) },
      })),
    };

    return NextResponse.json(serializableVenda, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao registrar venda:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}