"use client";

import { useState, useMemo, useEffect } from 'react';
import ModalAdicionarProduto from '@/components/ModalAdicionarProduto';
import ModalEditarProduto from '@/components/ModalEditarProduto';
import ModalExcluirProduto from '@/components/ModalExcluirProduto';
import ModalSucesso from '@/components/ModalSucesso';

// Tipos
type Produto = { id: number; nome: string; sku: string; preco: number; quantidade: number; };

// Tipo para dados brutos da API (onde Decimal é string)
type ProdutoFromAPI = Omit<Produto, 'preco'> & { preco: string };


const ActionIcon = ({ path, className = '' }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ITEMS_PER_PAGE = 5;

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [successModalInfo, setSuccessModalInfo] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      if (!response.ok) throw new Error('Erro ao buscar dados da API');
      const data: ProdutoFromAPI[] = await response.json();
      const typedData = data.map((p) => ({ ...p, preco: Number(p.preco) }));
      setProdutos(typedData);
    } catch (error) {
      console.error("Falha ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProdutos();
  }, []);

  const handleProductAdded = () => {
    fetchProdutos();
    setSuccessModalInfo({ isOpen: true, title: 'Produto Adicionado!', message: 'O novo produto foi cadastrado com sucesso.' });
  };

  const handleProductUpdated = () => {
    fetchProdutos();
    setSuccessModalInfo({ isOpen: true, title: 'Produto Atualizado!', message: 'Os dados do produto foram atualizados com sucesso.' });
  };

  const handleProductDeleted = () => {
    fetchProdutos();
    setSuccessModalInfo({ isOpen: true, title: 'Produto Excluído!', message: 'O produto foi removido permanentemente do sistema.' });
  };

  const filteredData = useMemo(() => {
    let items = produtos;
    if (activeTab !== 'Todos') {
      items = items.filter(p => {
        if (activeTab === 'Em Estoque') return p.quantidade > 10;
        if (activeTab === 'Baixo Estoque') return p.quantidade > 0 && p.quantidade <= 10;
        if (activeTab === 'Esgotado') return p.quantidade === 0;
        return true;
      });
    }
    if (searchTerm) {
      items = items.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return items;
  }, [searchTerm, activeTab, produtos]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleOpenEditModal = (produto: Produto) => {
    setSelectedProduct(produto);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (produto: Produto) => {
    setSelectedProduct(produto);
    setIsDeleteModalOpen(true);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedItems(e.target.checked ? filteredData.map(p => p.id) : []); };
  const handleSelectItem = (id: number) => { setSelectedItems(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]); };
  
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Esgotado</span>;
    if (quantity <= 10) return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">Baixo Estoque</span>;
    return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Em Estoque</span>;
  };
  
  const tabs = ['Todos', 'Em Estoque', 'Baixo Estoque', 'Esgotado'];

  return (
    <>
      <div className="w-full">
        <h1 className="text-3xl font-bold text-brand-dark mb-6">Gestão de Estoque</h1>
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative w-full sm:w-72"><input type="text" placeholder="Buscar por nome ou SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-brand-green focus:ring-brand-green" /><div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><ActionIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="text-gray-400" /></div></div>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2 font-bold text-white shadow transition-transform transform hover:scale-105 hover:opacity-90 w-full sm:w-auto">Adicionar Produto</button>
              </div>
              <div className="mt-4 -mb-px flex flex-wrap border-b border-gray-200">{tabs.map(tab => (<button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`whitespace-nowrap border-b-2 py-3 px-4 text-sm font-medium ${activeTab === tab ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab}</button>))}</div>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (<div className="text-center p-10">Carregando...</div>) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 align-middle"><input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" /></th><th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Produto</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Qtd.</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th></tr></thead>
                  <tbody className="divide-y divide-gray-200 bg-white">{paginatedData.map((produto) => (<tr key={produto.id} className={selectedItems.includes(produto.id) ? 'bg-green-50' : ''}><td className="px-6 py-4 align-middle"><input type="checkbox" checked={selectedItems.includes(produto.id)} onChange={() => handleSelectItem(produto.id)} className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" /></td><td className="px-6 py-4 align-middle"><div className="font-medium text-gray-900">{produto.nome}</div><div className="text-sm text-gray-500">{produto.sku} - R$ {produto.preco.toFixed(2)}</div></td><td className="px-6 py-4 align-middle">{getStockStatus(produto.quantidade)}</td><td className="px-6 py-4 align-middle text-sm text-gray-500">{produto.quantidade}</td><td className="px-6 py-4 align-middle text-right text-sm font-medium"><div className="flex items-center justify-end gap-4"><button onClick={() => handleOpenEditModal(produto)} className="text-gray-400 hover:text-blue-600" title="Editar"><ActionIcon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></button><button onClick={() => handleOpenDeleteModal(produto)} className="text-gray-400 hover:text-red-600" title="Excluir"><ActionIcon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></button></div></td></tr>))}</tbody>
                </table>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="text-sm text-gray-700">Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span></div>
              <div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Anterior</button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Próximo</button></div>
            </div>
        </div>
      </div>

      <ModalAdicionarProduto 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded} 
      />
      <ModalEditarProduto 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        produto={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
      <ModalExcluirProduto 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        produto={selectedProduct}
        onProductDeleted={handleProductDeleted}
      />
      <ModalSucesso
          isOpen={successModalInfo.isOpen}
          onClose={() => setSuccessModalInfo({ isOpen: false, title: '', message: '' })}
          title={successModalInfo.title}
          message={successModalInfo.message}
      />
    </>
  );
}