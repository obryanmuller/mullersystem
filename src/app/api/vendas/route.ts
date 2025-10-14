import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import type { Prisma } from '@prisma/client';

type VendaComRelacionamentos = Prisma.VendaGetPayload<{
  include: {
    cliente: true;
    itens: { include: { produto: true } };
  };
}>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchTerm = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    let whereClause: Prisma.VendaWhereInput = {};

    if (searchTerm) {
      const searchId = parseInt(searchTerm, 10);

      if (!isNaN(searchId)) {
        whereClause = { id: searchId };
      } else {
        whereClause = {
          cliente: {
            is: {
              nome: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        };
      }
    }

    const totalVendas = await prisma.venda.count({ where: whereClause });

    const vendas: VendaComRelacionamentos[] = await prisma.venda.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    const serializableVendas = vendas.map((venda) => {
      const clienteData = venda.cliente
        ? {
            ...venda.cliente,
            cpf: decrypt(venda.cliente.cpf),
            totalCompras: Number(venda.cliente.totalCompras),
          }
        : null;

      return {
        ...venda,
        total: Number(venda.total),
        cliente: clienteData,
        itens: venda.itens.map((item) => ({
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

    return NextResponse.json({
      data: serializableVendas,
      currentPage: page,
      totalPages: Math.ceil(totalVendas / limit),
      totalVendas,
      limit,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de vendas:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico de vendas' }, { status: 500 });
  }
}
