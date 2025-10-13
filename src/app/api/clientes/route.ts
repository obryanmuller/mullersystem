import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/crypto';

const prisma = new PrismaClient();

interface Params {
  id: string;
}

export async function GET(request: Request, context: { params: Params }) {
    try {
        const { id } = context.params;
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!cliente) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }

        // CORREÇÃO: Verificamos se o CPF existe antes de descriptografar
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


export async function PUT(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;
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

export async function DELETE(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;

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