import Link from 'next/link';
import Image from 'next/image';

const Icon = ({ path }) => (
  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-brand-dark text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 flex justify-center items-center border-b border-gray-700">
        <Image
          src="/logo/Logo.png" // Corrigido para o caminho da sua logo
          alt="Logo Muller System"
          width={150}
          height={50}
        />
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul>
          <li className="mb-2">
            <Link href="/" className="flex items-center p-3 rounded-lg hover:bg-brand-green transition-colors">
              <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/produtos" className="flex items-center p-3 rounded-lg bg-brand-green text-white font-semibold transition-colors">
              <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7l8 4" />
              Estoque
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/vendas" className="flex items-center p-3 rounded-lg hover:bg-brand-green transition-colors">
              <Icon path="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" />
              Vendas
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}