import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UsuarioLogado {
  id: number;
  email: string;
  role: string;
}

export function useAuth() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está logado
    const usuarioArmazenado = localStorage.getItem('usuario');
    
    if (usuarioArmazenado) {
      try {
        setUsuario(JSON.parse(usuarioArmazenado));
      } catch {
        localStorage.removeItem('usuario');
        router.push('/login');
      }
    }
    
    setIsLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    router.push('/login');
  };

  return { usuario, isLoading, logout };
}
