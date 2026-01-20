import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/crypto'; // Importa a função existente para simular hash

/**
 * POST: Rota para um usuário mestre criar um novo usuário.
 * ⚠️ NOTA DE SEGURANÇA: Em uma aplicação real, a senha deve ser hashada com bcrypt,
 * e não apenas criptografada/encriptada, e a rota deve ser protegida por autenticação e autorização (middleware).
 */
export async function POST(request: NextRequest) {
    try {
        const { email, password, role } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
        }
        
        // Simulação de Hash de Senha (Use bcrypt.hash() na produção!)
        const passwordHash = encrypt(password); 

        // Simulação de verificação de permissão do usuário solicitante (Deixe o role opcional para permitir o cadastro inicial)
        const userRole = role === 'MASTER' ? 'MASTER' : 'COMMON';

        const novoUsuario = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: userRole,
            }
        });

        // Remove o hash da senha antes de retornar
        const { passwordHash: _, ...usuarioRetorno } = novoUsuario;

        return NextResponse.json(usuarioRetorno, { status: 201 });

    } catch (error: any) {
        console.error("Erro ao criar usuário:", error);
        
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
             return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });
        }
        
        return NextResponse.json({ error: 'Erro interno do servidor ao criar usuário' }, { status: 500 });
    }
}