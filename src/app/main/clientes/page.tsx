"use client";

import { useState, useMemo, useEffect } from 'react';
import ModalAdicionarCliente from '@/components/ModalAdicionarCliente';
import ModalEditarCliente from '@/components/ModalEditarCliente';
import ModalExcluirCliente from '@/components/ModalExcluirCliente';
import ModalSucesso from '@/components/ModalSucesso';

type Cliente = { 
    id: number; 
    nome: string; 
    email: string; 
    telefone: string | null; 
    status: string; 
    totalCompras: number; 
    cpf: string; 
    enderecoRua: string;
    enderecoBairro: string;
    enderecoCidade: string;
    enderecoEstado: string;
    enderecoRef: string | null;
};

const ActionIcon = ({ path, className = '' }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const ITEMS_PER_PAGE = 5;

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [successModalInfo, setSuccessModalInfo] = useState({
        isOpen: false,
        title: '',
        message: '',
    });

    const fetchClientes = async () => {
        try {
            // Não precisa setar loading aqui se já está fazendo na função principal
            const response = await fetch('/api/clientes');
            if (!response.ok) throw new Error('Falha ao buscar clientes');
            const data = await response.json();
            const typedData = data.map((c: any) => ({ ...c, totalCompras: Number(c.totalCompras) }));
            setClientes(typedData);
        } catch (error) {
            console.error("Falha ao buscar clientes:", error);
        } finally {
            setIsLoading(false); // Garante que o loading termine mesmo se houver erro
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchClientes();
    }, []);

    const handleClientAdded = () => {
        fetchClientes();
        setSuccessModalInfo({ isOpen: true, title: 'Cliente Adicionado!', message: 'O novo cliente foi cadastrado com sucesso.' });
    };

    const handleClientUpdated = () => {
        fetchClientes();
        setSuccessModalInfo({ isOpen: true, title: 'Cliente Atualizado!', message: 'Os dados do cliente foram atualizados com sucesso.' });
    };

    const handleClientDeleted = () => {
        fetchClientes();
        setSuccessModalInfo({ isOpen: true, title: 'Cliente Excluído!', message: 'O cliente foi removido permanentemente do sistema.' });
    };
    
    // O resto das suas funções (filteredData, paginatedData, etc.) continuam iguais...
    const filteredData = useMemo(() => {
        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, clientes]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);
    
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const handleOpenEditModal = (cliente: Cliente) => {
        setSelectedClient(cliente);
        setIsEditModalOpen(true);
    };
    
    const handleOpenDeleteModal = (cliente: Cliente) => {
        setSelectedClient(cliente);
        setIsDeleteModalOpen(true);
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedItems(e.target.checked ? filteredData.map(c => c.id) : []); };
    const handleSelectItem = (id: number) => { setSelectedItems(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]); };
    
    const getStatusBadge = (status: string) => {
        if (status === 'Ativo') { return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Ativo</span>; }
        return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">Inativo</span>;
    };


    return (
        <>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-brand-dark mb-6">Gestão de Clientes</h1>
                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="relative w-full sm:w-72">
                                <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-brand-green focus:ring-brand-green" />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><ActionIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="text-gray-400" /></div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2 font-bold text-white shadow transition-transform transform hover:scale-105 hover:opacity-90 w-full sm:w-auto">
                                Adicionar Cliente
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="text-center p-10">Carregando clientes...</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 align-middle"><input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" /></th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Gasto</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {paginatedData.map((cliente) => (
                                        <tr key={cliente.id} className={selectedItems.includes(cliente.id) ? 'bg-green-50' : ''}>
                                            <td className="px-6 py-4 align-middle"><input type="checkbox" checked={selectedItems.includes(cliente.id)} onChange={() => handleSelectItem(cliente.id)} className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" /></td>
                                            <td className="px-6 py-4 align-middle"><div className="font-medium text-gray-900">{cliente.nome}</div><div className="text-sm text-gray-500">{cliente.email}</div></td>
                                            <td className="px-6 py-4 align-middle">{getStatusBadge(cliente.status)}</td>
                                            <td className="px-6 py-4 align-middle text-sm text-gray-600">R$ {cliente.totalCompras.toFixed(2)}</td>
                                            <td className="px-6 py-4 align-middle text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-4">
                                                    <button onClick={() => handleOpenEditModal(cliente)} className="text-gray-400 hover:text-blue-600" title="Editar"><ActionIcon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></button>
                                                    <button onClick={() => handleOpenDeleteModal(cliente)} className="text-gray-400 hover:text-red-600" title="Excluir"><ActionIcon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="text-sm text-gray-700">Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span></div>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Anterior</button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Próximo</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <ModalAdicionarCliente 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onClientAdded={handleClientAdded}
            />
            
            <ModalEditarCliente 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                cliente={selectedClient} 
                onClientUpdated={handleClientUpdated} 
            />

            <ModalExcluirCliente 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                cliente={selectedClient}
                onClientDeleted={handleClientDeleted}
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