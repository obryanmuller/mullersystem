// src/app/api/pendencias/[id]/pagar/route.ts
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
    console.error('Erro ao marcar como pago:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar como pago' },
      { status: 500 }
    );
  }
}
