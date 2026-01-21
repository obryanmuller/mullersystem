import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  // Verificar se o usuário está tentando acessar a área protegida
  if (request.nextUrl.pathname.startsWith('/main')) {
    const token = request.cookies.get('auth_token')?.value;
    
    // Se não houver token, redirecionar para login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validar o token JWT
    const payload = await verifyToken(token);
    
    // Se o token for inválido ou expirado, redirecionar para login
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token válido, permitir acesso
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/main/:path*'],
};
