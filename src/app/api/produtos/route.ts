// obryanmuller/mullersystem/mullersystem-72aa8aafde1da53f599f9c5c84aac0698a9390fe/src/app/api/produtos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Retorna todos os produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: 'asc' },
    });
    const serializableProdutos = produtos.map(p => ({
        ...p,
        preco: Number(p.preco),
        estoqueMinimo: Number(p.estoqueMinimo)
    }));
    return NextResponse.json(serializableProdutos);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

// POST: Cria um novo produto (Inclui estoqueMinimo)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const novoProduto = await prisma.produto.create({
      data: {
        nome: data.nome,
        sku: data.sku,
        preco: parseFloat(data.preco),
        quantidade: parseInt(data.quantidade, 10),
        estoqueMinimo: parseInt(data.estoqueMinimo, 10) || 10,
      },
    });
    const serializableProduto = {
        ...novoProduto,
        preco: Number(novoProduto.preco),
        estoqueMinimo: Number(novoProduto.estoqueMinimo)
    };
    return NextResponse.json(serializableProduto, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}