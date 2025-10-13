import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '@/lib/crypto';

const prisma = new PrismaClient();

interface ItemVendaPayload {
  produtoId: number;
  quantidade: number;
  preco: number;
}

interface VendaPayload {
  total: number;
  pagamento: string;
  clienteId?: number;
  itens: ItemVendaPayload[];
}

export async function POST(request: NextRequest) {
  try {
    const { total, pagamento, clienteId, itens }: VendaPayload = await request.json();

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
            quantidade: { decrement: item.quantidade },
          },
        });
      }

      if (clienteId) {
        await tx.cliente.update({
          where: { id: clienteId },
          data: {
            totalCompras: { increment: total },
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

    // Descriptografa o CPF do cliente, se existir
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
        produto: {
          ...item.produto,
          preco: Number(item.produto.preco),
        },
      })),
    };

    return NextResponse.json(serializableVenda, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao registrar venda:', error);
    let errorMessage = 'Não foi possível registrar a venda.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
