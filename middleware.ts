import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se o usuário está tentando acessar a área protegida
  if (request.nextUrl.pathname.startsWith('/main')) {
    const usuarioCookie = request.cookies.get('usuario');
    
    // Se não houver cookie, redirecionar para login
    if (!usuarioCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/main/:path*'],
};
