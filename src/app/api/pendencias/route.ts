// src/app/api/pendencias/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'TODAS';

    const where: Prisma.PendenciaWhereInput = {};

    if (filter === 'ABERTAS') {
      where.status = 'ABERTA';
    } else if (filter === 'PAGAS') {
      where.status = 'PAGA';
    } else if (filter === 'ATRASADAS') {
      where.status = 'ATRASADA';
    }

    const pendencias = await prisma.pendencia.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          }
        },
        venda: {
          select: { id: true }
        }
      },
      orderBy: {
        dataPendencia: 'desc'
      }
    });

    // Serializar Decimal
    const serialized = pendencias.map(p => ({
      ...p,
      valor: Number(p.valor),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Erro ao buscar pendências:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pendências' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { vendaId, clienteId, valor, descricao, dataVencimento } = await request.json();

    if (!vendaId || !clienteId || !valor) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Se não houver data de vencimento, calcula como +30 dias
    let vencimento = dataVencimento ? new Date(dataVencimento) : null;
    if (!vencimento) {
      vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 30);
    }

    const pendencia = await prisma.pendencia.create({
      data: {
        vendaId,
        clienteId,
        valor: parseFloat(valor),
        descricao: descricao || `Venda #${vendaId}`,
        dataVencimento: vencimento,
        status: 'ABERTA'
      }
    });

    return NextResponse.json(
      {
        ...pendencia,
        valor: Number(pendencia.valor),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Erro ao criar pendência:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pendência' },
      { status: 500 }
    );
  }
}
