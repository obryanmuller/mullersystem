import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { decrypt } from '@/lib/crypto'; // Importe a função de descriptografia

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

    const vendaRegistrada = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const venda = await tx.venda.create({
        data: {
          total: total,
          pagamento: pagamento,
          clienteId: clienteId,
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
            }
          }
        });
      }

      return tx.venda.findUnique({
        where: { id: venda.id },
        include: {
            itens: {
                include: {
                    produto: true
                }
            },
            cliente: true
        },
      });
    });

    // Se houver um cliente na venda, descriptografe o CPF dele
    let clienteFinal = null;
    if (vendaRegistrada?.cliente) {
        clienteFinal = {
            ...vendaRegistrada.cliente,
            totalCompras: Number(vendaRegistrada.cliente.totalCompras),
            cpf: decrypt(vendaRegistrada.cliente.cpf) // Descriptografando aqui!
        };
    }

    const serializableVenda = {
        ...vendaRegistrada,
        total: Number(vendaRegistrada?.total),
        cliente: clienteFinal, // Adiciona o cliente com CPF descriptografado
        itens: vendaRegistrada?.itens.map(item => {
            const typedItem = item as typeof item & { produto: { preco: Prisma.Decimal }};
            return {
                ...item,
                preco: Number(item.preco),
                produto: {
                    ...item.produto,
                    preco: Number(typedItem.produto.preco)
                }
            }
        })
    };

    return NextResponse.json(serializableVenda, { status: 201 });

  } catch (error: unknown) {
    console.error("Erro ao registrar venda:", error);
    let errorMessage = 'Não foi possível registrar a venda.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}