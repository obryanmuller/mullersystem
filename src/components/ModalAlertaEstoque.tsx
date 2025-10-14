// src/components/ModalAlertaEstoque.tsx

"use client";

import React from 'react';

type ProdutoAlerta = { 
    id: number; 
    nome: string; 
    sku: string; 
    quantidade: number;
    estoqueMinimo: number;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  products: ProdutoAlerta[];
};

export default function ModalAlertaEstoque({ isOpen, onClose, title, products }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-xl my-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-dark">{title} ({products.length})</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        {products.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum produto nesta categoria. Está tudo certo!</p>
        ) : (
            <div className="overflow-y-auto max-h-[70vh] border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd. Atual</th>
                            {title.includes("Em Alerta") && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd. Mínima</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((p) => (
                            <tr key={p.id} className={p.quantidade === 0 ? 'bg-red-50' : 'bg-yellow-50'}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{p.nome}</div>
                                    <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                                </td>
                                <td className={`px-6 py-4 text-right whitespace-nowrap text-sm font-bold ${p.quantidade === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {p.quantidade}
                                </td>
                                {title.includes("Em Alerta") && (
                                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                        {p.estoqueMinimo}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}