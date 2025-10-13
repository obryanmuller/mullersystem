import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt } from '@/lib/crypto'; // Importa a função de criptografia

// Inicializa o cliente Prisma fora das funções de rota para reutilização
const prisma = new PrismaClient();

/**
 * GET: Rota para buscar todos os clientes do banco de dados.
 */
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nome: 'asc', // Ordena os clientes por nome em ordem alfabética
      },
    });
    // Nota: O CPF retornado aqui estará criptografado. A descriptografia
    // deve acontecer apenas em rotas específicas que precisem do valor original.
    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar clientes' }, { status: 500 });
  }
}

/**
 * POST: Rota para criar um novo cliente no banco de dados.
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validação para garantir que os dados essenciais estão presentes
        if (!data.nome || !data.email || !data.cpf || !data.endereco) {
            return NextResponse.json({ error: 'Dados incompletos para criar cliente' }, { status: 400 });
        }
        
        // Criptografa o CPF antes de salvar
        const cpfCriptografado = encrypt(data.cpf);

        const novoCliente = await prisma.cliente.create({
            data: {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                cpf: cpfCriptografado, // Salva o CPF criptografado
                status: data.status || 'Ativo', // Garante um valor padrão se não for enviado
                // Mapeia o objeto de endereço para os campos planos do banco de dados
                enderecoRua: data.endereco.rua,
                enderecoBairro: data.endereco.bairro,
                enderecoCidade: data.endereco.cidade,
                enderecoEstado: data.endereco.estado,
                enderecoRef: data.endereco.referencia,
            }
        });
        
        // Retorna o cliente recém-criado (com o CPF ainda criptografado)
        return NextResponse.json(novoCliente, { status: 201 });

    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        
        // Tratamento de erro específico para campos únicos (como email e CPF)
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
             const target = (error as any).meta?.target || [];
             if (target.includes('email')) {
                return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });
             }
             if (target.includes('cpf')) {
                return NextResponse.json({ error: 'Este CPF já está cadastrado.' }, { status: 409 });
             }
        }
        
        // Retorno de erro genérico
        return NextResponse.json({ error: 'Erro interno do servidor ao criar cliente' }, { status: 500 });
    }
}