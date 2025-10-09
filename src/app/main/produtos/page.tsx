"use client";

import { useState } from 'react';
import ModalAdicionarProduto from '@/components/ModalAdicionarProduto';

// Componente de Ícone para os botões de ação
const ActionIcon = ({ path, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path d={path} />
  </svg>
);

export default function ProdutosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de exemplo
  const mockProdutos = [
    { id: 1, nome: 'Teclado Mecânico RGB', sku: 'TEC-001', preco: 250.50, quantidade: 30 },
    { id: 2, nome: 'Mouse Gamer 16000 DPI', sku: 'MOU-002', preco: 180.00, quantidade: 50 },
    { id: 3, nome: 'Monitor Ultrawide 29"', sku: 'MON-003', preco: 1200.75, quantidade: 15 },
    { id: 4, nome: 'Headset 7.1 Surround', sku: 'HEA-004', preco: 350.00, quantidade: 8 },
    { id: 5, nome: 'Webcam Full HD 1080p', sku: 'CAM-005', preco: 450.00, quantidade: 0 },
  ];

  // Filtra os produtos com base na busca
  const filteredProdutos = mockProdutos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para determinar o status do estoque
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Esgotado</span>;
    }
    if (quantity <= 10) {
      return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">Baixo Estoque</span>;
    }
    return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Em Estoque</span>;
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto">
        {/* Cabeçalho e Ações */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark">Gestão de Estoque</h1>
          <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            {/* Barra de Busca */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Buscar por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-brand-green focus:ring-brand-green"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {/* Botão Adicionar Produto */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2 font-bold text-white shadow transition-transform transform hover:scale-105 hover:opacity-90"
            >
              Adicionar Produto
            </button>
          </div>
        </header>

        {/* Tabela de Produtos */}
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome do Produto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Preço</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantidade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProdutos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{produto.nome}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">{produto.sku}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">R$ {produto.preco.toFixed(2).replace('.', ',')}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">{produto.quantidade}</td>
                  <td className="whitespace-nowrap px-6 py-4">{getStockStatus(produto.quantidade)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      <button className="text-blue-600 hover:text-blue-900" title="Editar">
                        <ActionIcon path="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z M5 14a1 1 0 00-1 1v2a1 1 0 001 1h10a1 1 0 001-1v-2a1 1 0 00-1-1H5z" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Excluir">
                        <ActionIcon path="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalAdicionarProduto
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}