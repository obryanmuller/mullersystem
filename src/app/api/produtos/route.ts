import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Equivalente ao seu GET em /api/produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(produtos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

// Equivalente ao seu POST em /api/produtos
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
    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}