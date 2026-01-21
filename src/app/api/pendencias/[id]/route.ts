// src/app/api/pendencias/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pendenciaId = parseInt(id);

    const pendencia = await prisma.pendencia.update({
      where: { id: pendenciaId },
      data: {
        status: 'PAGA',
        dataPago: new Date(),
      },
      include: {
        cliente: true,
        venda: true,
      }
    });

    // Se a pendência foi paga e refere-se a uma venda "A Prazo", criar entrada no caixa
    if (pendencia.venda.pagamento === 'A Prazo') {
      await prisma.movimentacaoCaixa.create({
        data: {
          tipo: 'ENTRADA',
          valor: pendencia.valor,
          descricao: `Recebimento da Venda #${pendencia.venda.id} | Cliente: ${pendencia.cliente.nome} | A Prazo`
        }
      });
    }

    return NextResponse.json({
      ...pendencia,
      valor: Number(pendencia.valor),
    });
  } catch (error: unknown) {
    console.error('Erro ao atualizar pendência:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pendência' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pendenciaId = parseInt(id);

    await prisma.pendencia.delete({
      where: { id: pendenciaId }
    });

    return NextResponse.json(
      { message: 'Pendência cancelada' }
    );
  } catch (error: unknown) {
    console.error('Erro ao deletar pendência:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar pendência' },
      { status: 500 }
    );
  }
}
