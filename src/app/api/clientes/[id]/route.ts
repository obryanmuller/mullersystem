import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/crypto';

const prisma = new PrismaClient();

interface Params {
  id: string;
}

/**
 * GET: Rota para buscar um cliente específico.
 */
export async function GET(request: Request, context: { params: Params }) {
    try {
        const { id } = context.params;
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!cliente) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }

        // Descriptografa o CPF e converte o Decimal para número
        const clienteComCpfReal = {
            ...cliente,
            cpf: decrypt(cliente.cpf),
            totalCompras: Number(cliente.totalCompras), // <-- CORREÇÃO
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
export async function PUT(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;
    const data = await request.json();

    const cpfCriptografado = data.cpf ? encrypt(data.cpf) : undefined;

    const updatedCliente = await prisma.cliente.update({
      where: {
        id: parseInt(id, 10),
      },
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

    // Converte o Decimal para número antes de enviar a resposta
    const serializableCliente = {
        ...updatedCliente,
        totalCompras: Number(updatedCliente.totalCompras), // <-- CORREÇÃO
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