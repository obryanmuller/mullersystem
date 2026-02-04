// obryanmuller/mullersystem/mullersystem-72aa8aafde1da53f599f9c5c84aac0698a9390fe/src/app/api/produtos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Retorna todos os produtos ou busca por SKU quando query param 'sku' for fornecido
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');

    if (sku) {
      const produto = await prisma.produto.findUnique({ where: { sku } });
      if (!produto) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      }
      return NextResponse.json({
        ...produto,
        preco: Number(produto.preco),
        estoqueMinimo: Number(produto.estoqueMinimo),
      });
    }

    const produtos = await prisma.produto.findMany({
      orderBy: { nome: 'asc' },
    });
    const serializableProdutos = produtos.map(p => ({
        ...p,
        preco: Number(p.preco),
        estoqueMinimo: Number(p.estoqueMinimo)
    }));
    return NextResponse.json(serializableProdutos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
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