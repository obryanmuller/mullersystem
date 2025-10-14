// obryanmuller/mullersystem/mullersystem-72aa8aafde1da53f599f9c5c84aac0698a9390fe/src/app/api/produtos/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Busca produto por ID
// TIPO CORRIGIDO para satisfazer o compilador da Vercel
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Aguarda e desestrutura o id
    const { id } = await context.params; 
    const idNum = parseInt(id, 10);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 });
    }
    
    const produto = await prisma.produto.findUnique({ 
        where: { id: idNum } 
    });

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ 
        ...produto, 
        preco: Number(produto.preco),
        estoqueMinimo: Number(produto.estoqueMinimo)
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
  }
}

// PUT: Atualiza um produto por ID
// TIPO CORRIGIDO para satisfazer o compilador da Vercel
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Aguarda e desestrutura o id
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    const data = await request.json();

    const updatedProduto = await prisma.produto.update({
      where: { id: idNum },
      data: {
        nome: data.nome,
        sku: data.sku,
        preco: parseFloat(data.preco),
        quantidade: parseInt(data.quantidade, 10),
        estoqueMinimo: parseInt(data.estoqueMinimo, 10) || 10,
      },
    });

    return NextResponse.json({ 
        ...updatedProduto, 
        preco: Number(updatedProduto.preco),
        estoqueMinimo: Number(updatedProduto.estoqueMinimo)
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// DELETE: Exclui um produto por ID
// TIPO CORRIGIDO para satisfazer o compilador da Vercel
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Aguarda e desestrutura o id
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    
    await prisma.produto.delete({ where: { id: idNum } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}