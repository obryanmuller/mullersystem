import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/crypto';

const prisma = new PrismaClient();

/**
 * GET: Rota para buscar um cliente específico.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 });
        }

        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!cliente) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }

        const cpfOriginal = cliente.cpf ? decrypt(cliente.cpf) : '';

        const clienteComCpfReal = {
            ...cliente,
            cpf: cpfOriginal,
            totalCompras: Number(cliente.totalCompras),
        };

        return NextResponse.json(clienteComCpfReal);
    } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 });
    }
}

/**
 * PUT: Rota para atualizar um cliente existente.
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const cpfCriptografado = data.cpf ? encrypt(data.cpf) : undefined;

    const updatedCliente = await prisma.cliente.update({
      where: { id: parseInt(id, 10) },
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpf: cpfCriptografado,
        status: data.status,
        enderecoRua: data.endereco.rua,
        enderecoBairro: data.endereco.bairro,
        enderecoCidade: data.endereco.cidade,
        enderecoEstado: data.endereco.estado,
        enderecoRef: data.endereco.referencia,
      },
    });

    const serializableCliente = {
        ...updatedCliente,
        totalCompras: Number(updatedCliente.totalCompras),
    };

    return NextResponse.json(serializableCliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

/**
 * DELETE: Rota para excluir um cliente.
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.cliente.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 });
  }
}