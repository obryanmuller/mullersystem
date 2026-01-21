import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import type { Prisma } from '@prisma/client';

// 1. Definição dos tipos para evitar erros de build (noImplicitAny)
interface ItemVendaInput {
  produtoId: number;
  quantidade: number;
  preco: number;
}

interface VendaBody {
  total: number;
  pagamento: string;
  clienteId?: number | null;
  itens: ItemVendaInput[];
}

type VendaComRelacionamentos = Prisma.VendaGetPayload<{
  include: {
    cliente: true;
    itens: { include: { produto: true } };
  };
}>;

// GET: Busca o histórico de vendas
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

// POST: Cria uma nova venda e atualiza o estoque
export async function POST(request: NextRequest) {
  try {
    // 2. Tipagem explícita do corpo da requisição
    const body = (await request.json()) as VendaBody;
    const { total, pagamento, clienteId, itens } = body;

    // Validação básica
    if (!total || !pagamento || !itens || itens.length === 0) {
      return NextResponse.json({ error: 'Dados da venda inválidos' }, { status: 400 });
    }

    // Transaction garante que: Venda Salva + Estoque Atualizado
    const vendaCriada = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Criar a Venda e os Itens
      const novaVenda = await tx.venda.create({
        data: {
          total: total,
          pagamento: pagamento,
          clienteId: clienteId || null,
          itens: {
            create: itens.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              preco: item.preco
            }))
          }
        },
        include: {
          cliente: true,
          itens: {
            include: {
              produto: true
            }
          }
        }
      });

      // 2. Atualizar o estoque dos produtos (Loop)
      for (const item of itens) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidade: {
              decrement: item.quantidade
            }
          }
        });
      }

      // 3. Se tiver cliente, atualiza o total de compras dele
      if (clienteId) {
        await tx.cliente.update({
          where: { id: clienteId },
          data: {
            totalCompras: {
              increment: total
            }
          }
        });
      }

      // 4. Criar movimentação de entrada no caixa
      const clienteNome = novaVenda.cliente?.nome || 'Consumidor Final';
      
      // Se não for "A Prazo", registra entrada imediata no caixa
      if (pagamento !== 'A Prazo') {
        await tx.movimentacaoCaixa.create({
          data: {
            tipo: 'ENTRADA',
            valor: total,
            descricao: `Venda #${novaVenda.id} | Cliente: ${clienteNome} | Pagamento: ${pagamento}`
          }
        });
      }

      return novaVenda;
    });

    // 5. Se for "A Prazo" com cliente, criar pendência (fora da transação)
    if (pagamento === 'A Prazo' && clienteId) {
      await prisma.pendencia.create({
        data: {
          vendaId: vendaCriada.id,
          clienteId: clienteId,
          valor: total,
          descricao: `Venda #${vendaCriada.id}`,
          status: 'ABERTA'
        }
      });
    }

    // Formata a resposta para o frontend
    const responseData = {
      id: vendaCriada.id,
      total: Number(vendaCriada.total),
      pagamento: vendaCriada.pagamento,
      cliente: vendaCriada.cliente ? {
         nome: vendaCriada.cliente.nome,
         cpf: decrypt(vendaCriada.cliente.cpf), 
         enderecoRua: vendaCriada.cliente.enderecoRua,
         enderecoBairro: vendaCriada.cliente.enderecoBairro,
         enderecoCidade: vendaCriada.cliente.enderecoCidade,
         enderecoEstado: vendaCriada.cliente.enderecoEstado,
      } : undefined,
      itens: vendaCriada.itens.map((item) => ({
        produto: { nome: item.produto.nome },
        preco: Number(item.preco),
        quantidade: item.quantidade
      }))
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error("Erro ao processar venda:", error);
    return NextResponse.json({ error: 'Erro interno ao processar a venda' }, { status: 500 });
  }
}