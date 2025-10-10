"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Icon = ({ path }) => (
  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();

  // Função para verificar se o link está ativo (exato para o dashboard, início para os outros)
  const isActive = (href) => {
    return href === '/' ? pathname === href : pathname.startsWith(href);
  };

  const linkStyle = "flex items-center p-3 rounded-lg transition-colors";
  const activeLinkStyle = "bg-brand-green text-white font-semibold";
  const inactiveLinkStyle = "hover:bg-brand-green";

  return (
    <aside className="w-64 h-screen bg-brand-dark text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 flex justify-center items-center border-b border-gray-700">
        <Image
          src="/logo/LogoMverde.png" // Utilizando a logo que você já tem
          alt="Logo Muller System"
          width={150}
          height={50}
        />
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul>
          <li className="mb-2">
            <Link 
              href="/main/dashboard" 
              className={`${linkStyle} ${isActive('/') ? activeLinkStyle : inactiveLinkStyle}`}
            >
              <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/main/produtos" 
              className={`${linkStyle} ${isActive('/produtos') ? activeLinkStyle : inactiveLinkStyle}`}
            >
              <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7l8 4" />
              Estoque
            </Link>
          </li>
          {/* NOVO LINK DE CLIENTES ADICIONADO AQUI */}
          <li className="mb-2">
            <Link 
              href="/main/clientes" 
              className={`${linkStyle} ${isActive('/clientes') ? activeLinkStyle : inactiveLinkStyle}`}
            >
              <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 003 16v5" />
              Clientes
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/main/vendas" 
              className={`${linkStyle} ${isActive('/vendas') ? activeLinkStyle : inactiveLinkStyle}`}
            >
              <Icon path="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" />
              Vendas
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}