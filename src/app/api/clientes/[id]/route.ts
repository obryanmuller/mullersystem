import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { encrypt } from '@/lib/crypto';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        if (!data.nome || !data.email || !data.cpf || !data.endereco) {
            return NextResponse.json({ error: 'Dados incompletos para criar cliente' }, { status: 400 });
        }
        
        const cpfCriptografado = encrypt(data.cpf);

        const novoCliente = await prisma.cliente.create({
            data: {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                cpf: cpfCriptografado,
                status: data.status || 'Ativo',
                enderecoRua: data.endereco.rua,
                enderecoBairro: data.endereco.bairro,
                enderecoCidade: data.endereco.cidade,
                enderecoEstado: data.endereco.estado,
                enderecoRef: data.endereco.referencia,
            }
        });
        return NextResponse.json(novoCliente, { status: 201 });

    } catch (error: unknown) {
        console.error("Erro ao criar cliente:", error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                 const target = (error.meta?.target as string[]) || [];
                 if (target.includes('email')) {
                    return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });
                 }
                 if (target.includes('cpf')) {
                    return NextResponse.json({ error: 'Este CPF já está cadastrado.' }, { status: 409 });
                 }
            }
        }
        
        return NextResponse.json({ error: 'Erro interno do servidor ao criar cliente' }, { status: 500 });
    }
}