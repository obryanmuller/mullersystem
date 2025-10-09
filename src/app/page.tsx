"use client";

import { useState } from 'react';
import ModalAdicionarProduto from '@/components/ModalAdicionarProduto'; // Verifique se este caminho está correto

const mockProdutos = [
  { id: 1, nome: 'Teclado Mecânico RGB', sku: 'TEC-001', preco: 250.50, quantidade: 30 },
  { id: 2, nome: 'Mouse Gamer 16000 DPI', sku: 'MOU-002', preco: 180.00, quantidade: 50 },
  { id: 3, nome: 'Monitor Ultrawide 29"', sku: 'MON-003', preco: 1200.75, quantidade: 15 },
  { id: 4, nome: 'Headset 7.1 Surround', sku: 'HEA-004', preco: 350.00, quantidade: 25 },
];

export default function ProdutosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">
          Gestão de Estoque
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-green hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
        >
          Adicionar Produto
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nome do Produto</th>
              <th className="p-4 font-semibold text-gray-600">SKU</th>
              <th className="p-4 font-semibold text-gray-600">Preço (R$)</th>
              <th className="p-4 font-semibold text-gray-600">Qtd. em Estoque</th>
            </tr>
          </thead>
          <tbody>
            {mockProdutos.map((produto) => (
              <tr key={produto.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-4 text-gray-800">{produto.nome}</td>
                <td className="p-4 text-gray-500">{produto.sku}</td>
                <td className="p-4 text-gray-800">{produto.preco.toFixed(2).replace('.', ',')}</td>
                <td className="p-4 text-gray-800">{produto.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ModalAdicionarProduto
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}