'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login');
        return;
      }

      // Login bem-sucedido
      localStorage.setItem('usuario', JSON.stringify(data));
      router.push('/main/dashboard');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao conectar com o servidor';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Coluna da Esquerda (Branding) */}
      <div className="hidden items-center justify-center bg-brand-dark p-12 md:flex">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo/LogoSideBar.png"
            alt="Logo Muller System"
            width={200}
            height={200}
            priority
          />
          <h1 className="mt-6 text-4xl font-bold text-white">
            Bem-vindo de volta!
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Gerencie seu negócio de forma eficiente.
          </p>
        </div>
      </div>

      {/* Coluna da Direita (Formulário) */}
      <div className="flex items-center justify-center bg-brand-light p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-brand-dark">Acesse sua conta</h2>
            <p className="mt-2 text-gray-500">
              Entre com suas credenciais para continuar.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  href="#"
                  className="font-medium text-brand-green hover:text-green-700"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-brand-green py-2 px-4 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link
              href="#"
              className="font-medium text-brand-green hover:text-green-700"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}