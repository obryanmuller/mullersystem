import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
    const serializableProdutos = produtos.map(p => ({
        ...p,
        preco: Number(p.preco)
    }));
    return NextResponse.json(serializableProdutos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error); // CORRIGIDO: Usando a variável 'error'
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const novoProduto = await prisma.produto.create({
      data: {
        nome: data.nome,
        sku: data.sku,
        preco: parseFloat(data.preco),
        quantidade: parseInt(data.quantidade, 10),
      },
    });
    const serializableProduto = {
        ...novoProduto,
        preco: Number(novoProduto.preco)
    };
    return NextResponse.json(serializableProduto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error); // CORRIGIDO: Usando a variável 'error'
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}