// src/components/Sidebar.jsx
"use client";

import { useState } from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiHome, FiPackage, FiUsers, FiShoppingCart, FiClock, FiDollarSign, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { usuario, logout } = useAuth();

  const isActive = (href) => pathname.startsWith(href);
  
  const handleLinkClick = () => setIsOpen(false);

  const linkStyle = "flex items-center p-3 rounded-lg transition-colors";
  const activeLinkStyle = "bg-brand-green text-white font-semibold";
  const inactiveLinkStyle = "hover:bg-brand-green text-gray-300";

  return (
    <>
      {/* Botão Hamburger */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-[1010] p-2 rounded-full bg-brand-green text-white shadow-lg focus:outline-none" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>
      
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black opacity-50 z-[1005]" onClick={() => setIsOpen(false)} />}

      <aside className={`
        w-64 h-screen bg-brand-dark text-white flex flex-col 
        fixed top-0 left-0 z-[1006] transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:static lg:translate-x-0 lg:shadow-none lg:h-auto lg:min-h-screen lg:z-auto
        shadow-xl
      `}>
        {/* Logo */}
        <div className="p-6 flex justify-center items-center border-b border-gray-700">
          <Image src="/logo/LogoMverde.png" alt="Logo Muller System" width={150} height={50} />
        </div>

        {/* Usuário Logado */}
        {usuario && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                <FiUser className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{usuario.email}</p>
                <p className="text-xs text-gray-400">{usuario.role === 'MASTER' ? 'Administrador' : 'Usuário'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <nav className="flex-1 p-4">
          <ul>
            <li className="mb-2">
              <Link href="/main/dashboard" className={`${linkStyle} ${isActive('/main/dashboard') ? activeLinkStyle : inactiveLinkStyle}`} onClick={handleLinkClick}>
                <FiHome className="w-5 h-5 mr-3" /> Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/main/vendas" className={`${linkStyle} ${isActive('/main/vendas') ? activeLinkStyle : inactiveLinkStyle}`} onClick={handleLinkClick}>
                <FiShoppingCart className="w-5 h-5 mr-3" /> Vendas
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/main/produtos" className={`${linkStyle} ${isActive('/main/produtos') ? activeLinkStyle : inactiveLinkStyle}`} onClick={handleLinkClick}>
                <FiPackage className="w-5 h-5 mr-3" /> Estoque
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/main/clientes" className={`${linkStyle} ${isActive('/main/clientes') ? activeLinkStyle : inactiveLinkStyle}`} onClick={handleLinkClick}>
                <FiUsers className="w-5 h-5 mr-3" /> Clientes
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/main/historico" className={`${linkStyle} ${isActive('/main/historico') ? activeLinkStyle : inactiveLinkStyle}`} onClick={handleLinkClick}>
                <FiClock className="w-5 h-5 mr-3" /> Histórico
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/main/caixa" className={`${linkStyle} ${isActive('/main/caixa') ? activeLinkStyle : inactiveLinkStyle}`} onClick={handleLinkClick}>
                <FiDollarSign className="w-5 h-5 mr-3" /> Fluxo de Caixa
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              logout();
              handleLinkClick();
            }}
            className={`w-full ${linkStyle} ${inactiveLinkStyle} justify-center`}
          >
            <FiLogOut className="w-5 h-5 mr-2" /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}
