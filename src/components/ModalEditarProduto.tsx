// obryanmuller/mullersystem/mullersystem-72aa8aafde1da53f599f9c5c84aac0698a9390fe/src/components/ModalEditarProduto.tsx
"use client";
import { useState, useEffect } from 'react';

// ATUALIZADO: Adicionando estoqueMinimo ao tipo Produto
type Produto = { id: number; nome: string; sku: string; preco: number; quantidade: number; estoqueMinimo: number };
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto | null;
  onProductUpdated: () => void;
};

export default function ModalEditarProduto({ isOpen, onClose, produto, onProductUpdated }: ModalProps) {
  // ATUALIZADO: Adicionando estoqueMinimo ao estado inicial
  const [formData, setFormData] = useState({ nome: '', sku: '', preco: '0', quantidade: '0', estoqueMinimo: '0' });

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome,
        sku: produto.sku,
        preco: String(produto.preco),
        quantidade: String(produto.quantidade),
        estoqueMinimo: String(produto.estoqueMinimo), // <-- CARREGA VALOR
      });
    }
  }, [produto]);

  if (!isOpen || !produto) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/produtos/${produto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            preco: parseFloat(formData.preco),
            quantidade: parseInt(formData.quantidade, 10),
            estoqueMinimo: parseInt(formData.estoqueMinimo, 10) // <-- CONVERTE ANTES DE ENVIAR
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao atualizar o produto');
      }

      onProductUpdated();
      onClose();
    } catch (error: unknown) {
        let errorMessage = 'Ocorreu um erro desconhecido.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Detalhes do erro:", error);
        alert(`Erro ao atualizar o produto: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Editar Produto: {produto.nome}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Produto</label><input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1"><label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label><input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
                <div className="md:col-span-1"><label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço (R$)</label><input type="number" step="0.01" id="preco" name="preco" value={formData.preco} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
                <div className="md:col-span-1"><label htmlFor="quantidade" className="block text-sm font-medium text-gray-700">Quantidade</label><input type="number" id="quantidade" name="quantidade" value={formData.quantidade} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
                <div className="md:col-span-1">
                    <label htmlFor="estoqueMinimo" className="block text-sm font-medium text-gray-700">Qtd. Mínima</label>
                    <input 
                        type="number" 
                        id="estoqueMinimo" 
                        name="estoqueMinimo" 
                        value={formData.estoqueMinimo} 
                        onChange={handleChange} 
                        required 
                        min={0}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" 
                    />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90">Salvar Alterações</button>
            </div>
        </form>
      </div>
    </div>
  );
}