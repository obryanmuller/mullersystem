import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para os parâmetros da URL (para garantir a tipagem do 'id')
interface Params {
  id: string;
}

/**
 * PUT: Rota para atualizar um produto existente.
 */
export async function PUT(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;
    const data = await request.json();

    const updatedProduto = await prisma.produto.update({
      where: {
        id: parseInt(id, 10), // Converte o ID da URL para número
      },
      data: {
        nome: data.nome,
        sku: data.sku,
        preco: parseFloat(data.preco),
        quantidade: parseInt(data.quantidade, 10),
      },
    });

    return NextResponse.json(updatedProduto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

/**
 * DELETE: Rota para excluir um produto.
 */
export async function DELETE(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;

    await prisma.produto.delete({
      where: {
        id: parseInt(id, 10), // Converte o ID da URL para número
      },
    });

    // Retorna uma resposta vazia com status 204 (No Content) para indicar sucesso
    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}