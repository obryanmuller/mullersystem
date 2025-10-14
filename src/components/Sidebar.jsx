// src/components/Sidebar.jsx
"use client";

import { useState } from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
// Importar ícones (substituindo o seu componente <Icon> por algo como react-icons/fi)
import { FiMenu, FiX } from 'react-icons/fi'; 

// Se você está usando SVG inline, manteremos seu componente Icon, mas vamos adicionar FiMenu e FiX
const Icon = ({ path }) => (
  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // <--- Novo estado para mobile

  // Função para verificar se o link está ativo
  // **Ajuste:** Mudei a lógica de verificação para acomodar a estrutura /main/x
  const isActive = (href) => {
    // Ex: href é '/main/produtos'. Verifica se o pathname começa com ele.
    return pathname.startsWith(href);
  };
  
  const handleLinkClick = () => {
    setIsOpen(false); // Fechar o menu ao clicar em um link (útil para mobile)
  };

  const linkStyle = "flex items-center p-3 rounded-lg transition-colors";
  // **Ajuste:** Adicione uma cor mais visível para o texto inativo para que o hover funcione
  const activeLinkStyle = "bg-brand-green text-white font-semibold";
  const inactiveLinkStyle = "hover:bg-brand-green text-gray-300"; // <--- Ajuste de cor de texto

  return (
    <>
      {/* Botão Hambúrguer (Visível apenas em mobile/tablet - até 1024px) */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-[1010] p-2 rounded-full bg-brand-green text-white shadow-lg focus:outline-none" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>
      
      {/* Overlay Escuro (Visível apenas em mobile/tablet e quando aberto) */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black opacity-50 z-[1005]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Principal */}
      <aside 
        className={`
          w-64 h-screen bg-brand-dark text-white flex flex-col 
          fixed top-0 left-0 z-[1006] transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:static lg:translate-x-0 lg:shadow-none lg:h-auto lg:min-h-screen lg:z-auto
          shadow-xl
        `}
      >
        {/* Logo */}
        <div className="p-6 flex justify-center items-center border-b border-gray-700">
          <Image
            src="/logo/LogoMverde.png"
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
                // Ajuste a verificação para 'isActive('/main/dashboard')'
                className={`${linkStyle} ${isActive('/main/dashboard') ? activeLinkStyle : inactiveLinkStyle}`} 
                onClick={handleLinkClick}
              >
                <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link 
                href="/main/produtos" 
                className={`${linkStyle} ${isActive('/main/produtos') ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={handleLinkClick}
              >
                <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7l8 4" />
                Estoque
              </Link>
            </li>
            <li className="mb-2">
              <Link 
                href="/main/clientes" 
                className={`${linkStyle} ${isActive('/main/clientes') ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={handleLinkClick}
              >
                <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 003 16v5" />
                Clientes
              </Link>
            </li>
            <li className="mb-2">
              <Link 
                href="/main/vendas" 
                className={`${linkStyle} ${isActive('/main/vendas') ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={handleLinkClick}
              >
                <Icon path="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" />
                Vendas
              </Link>
            </li>
            <li className="mb-2">
              <Link // NOVO LINK ADICIONADO
                href="/main/historico" 
                className={`${linkStyle} ${isActive('/main/historico') ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={handleLinkClick}
              >
                <Icon path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
                Histórico
              </Link>
            </li>
             <li className="mb-2">
              <Link // NOVO LINK ADICIONADO
                href="/main/caixa" 
                className={`${linkStyle} ${isActive('/main/caixa') ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={handleLinkClick}
              >
                <Icon path="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m7 5l-4 4-4-4m4 4V9" />
                Fluxo de Caixa
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}