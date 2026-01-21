// src/app/api/clientes/[id]/atualizar-status/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clienteId = parseInt(id);

    // Buscar todas as pendências do cliente
    const pendenciasAtrasadas = await prisma.pendencia.findMany({
      where: {
        clienteId: clienteId,
        status: 'ABERTA',
        dataVencimento: {
          lt: new Date() // Data de vencimento no passado
        }
      }
    });

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Se tem pendências atrasadas, marca como inativo
    if (pendenciasAtrasadas.length > 0) {
      await prisma.cliente.update({
        where: { id: clienteId },
        data: { status: 'Inativo' }
      });

      // Também marca as pendências como ATRASADAS
      await prisma.pendencia.updateMany({
        where: {
          clienteId: clienteId,
          status: 'ABERTA',
          dataVencimento: {
            lt: new Date()
          }
        },
        data: { status: 'ATRASADA' }
      });

      return NextResponse.json({
        message: 'Cliente marcado como inativo por ter pendências em atraso',
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          status: 'Inativo',
          pendenciasAtrasadas: pendenciasAtrasadas.length
        }
      });
    }

    // Se não tem pendências atrasadas, marca como ativo novamente
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { status: 'Ativo' }
    });

    return NextResponse.json({
      message: 'Cliente marcado como ativo',
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        status: 'Ativo'
      }
    });

  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Erro ao atualizar status do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status do cliente' },
      { status: 500 }
    );
  }
}
