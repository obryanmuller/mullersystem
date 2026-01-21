import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e senha são obrigatórios.' },
                { status: 400 }
            );
        }

        // Buscar usuário pelo email
        const usuario = await prisma.user.findUnique({
            where: { email }
        });

        if (!usuario) {
            return NextResponse.json(
                { error: 'Email ou senha incorretos.' },
                { status: 401 }
            );
        }

        // Verificar a senha
        try {
            const senhaDescriptografada = decrypt(usuario.passwordHash);
            if (senhaDescriptografada !== password) {
                return NextResponse.json(
                    { error: 'Email ou senha incorretos.' },
                    { status: 401 }
                );
            }
        } catch (error) {
            return NextResponse.json(
                { error: 'Email ou senha incorretos.' },
                { status: 401 }
            );
        }

        // Remover a senha antes de retornar
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...usuarioRetorno } = usuario;

        // Criar resposta com cookie de sessão
        const response = NextResponse.json(usuarioRetorno, { status: 200 });
        
        // Armazenar informações do usuário no cookie (ou você pode usar JWT)
        response.cookies.set('usuario', JSON.stringify(usuarioRetorno), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
        });

        return response;

    } catch (error: unknown) {
        console.error("Erro ao fazer login:", error);
        return NextResponse.json(
            { error: 'Erro interno do servidor ao fazer login' },
            { status: 500 }
        );
    }
}
