import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Muller System', // Título atualizado
  description: 'Sistema de Ponto de Venda',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <div className="flex">
          <Sidebar />
          {/* A cor de fundo clara da marca é aplicada aqui */}
         <main className="flex-1 min-h-screen bg-brand-green">
  {children}
</main>
        </div>
      </body>
    </html>
  );
}