import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Muller System',
  description: 'Sistema de Ponto de Venda',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* Agora este layout apenas renderiza o conteúdo da página, sem adicionar a sidebar */}
        {children}
      </body>
    </html>
  );
}