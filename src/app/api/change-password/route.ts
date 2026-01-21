// src/app/api/change-password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/crypto';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const { senhaAtual, senhaNova } = await request.json();

    if (!senhaAtual || !senhaNova) {
      return NextResponse.json(
        { error: 'Senha atual e nova são obrigatórias' },
        { status: 400 }
      );
    }

    if (senhaNova.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar o usuário
    const usuario = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se a senha atual está correta
    try {
      const senhaDescriptografada = decrypt(usuario.passwordHash);
      if (senhaDescriptografada !== senhaAtual) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro ao verificar senha' },
        { status: 500 }
      );
    }

    // Atualizar a senha
    const novaSenhaEncriptada = encrypt(senhaNova);
    await prisma.user.update({
      where: { id: payload.id },
      data: {
        passwordHash: novaSenhaEncriptada
      }
    });

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
