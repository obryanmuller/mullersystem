import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { generateToken } from '@/lib/jwt';

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

        // Gerar token JWT
        const token = await generateToken({
            id: usuario.id,
            email: usuario.email,
            role: usuario.role,
        });

        // Remover a senha antes de retornar
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...usuarioRetorno } = usuario;

        // Criar resposta com token JWT em cookie
        const response = NextResponse.json(
            {
                ...usuarioRetorno,
                token,
            },
            { status: 200 }
        );
        
        // Armazenar JWT no cookie httpOnly
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
        });

        // Manter cookie de usuário para acesso no frontend (sem senha)
        response.cookies.set('usuario', JSON.stringify(usuarioRetorno), {
            httpOnly: false,
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
