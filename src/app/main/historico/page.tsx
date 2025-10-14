// src/app/main/historico/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react'; 
import ModalVendaConcluida from '@/components/ModalVendaConcluida';

// Tipos baseados na API de Vendas
type ClienteInfo = { 
    nome: string; 
    cpf: string; 
    enderecoRua: string;
    enderecoBairro: string;
    enderecoCidade: string;
    enderecoEstado: string;
};

type VendaItem = {
    quantidade: number;
    preco: number;
    produto: { nome: string };
};

type Venda = {
    id: number;
    total: number;
    pagamento: string;
    createdAt: string; 
    cliente: ClienteInfo | null;
    itens: VendaItem[];
};

// Tipo para o retorno paginado da API
type VendaApiResponse = {
    data: Venda[];
    currentPage: number;
    totalPages: number;
    totalVendas: number;
    limit: number;
};

const ActionIcon = ({ path, className = '' }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const ITEMS_PER_PAGE = 10; // Definindo o limite de itens por página

export default function HistoricoPage() {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState<Venda | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalPages, setTotalPages] = useState(1); 
    const [totalSales, setTotalSales] = useState(0); 

    const fetchHistorico = useCallback(async (page: number, search: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                search: search,
            });
            
            const response = await fetch(`/api/vendas?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao buscar histórico de vendas');
            
            const result: VendaApiResponse = await response.json();

            setVendas(result.data);
            setCurrentPage(result.currentPage);
            setTotalPages(result.totalPages);
            setTotalSales(result.totalVendas);
        } catch (error) {
            console.error("Falha ao buscar histórico:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHistorico(currentPage, searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, fetchHistorico]);
    
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleGenerateReport = () => {
        const dataToExport = vendas; 

        if (dataToExport.length === 0) {
            alert("Não há dados na página atual para gerar o relatório.");
            return;
        }

        const headers = ["ID", "Data", "Cliente Nome", "Cliente CPF", "Total", "Pagamento", "Itens Vendidos"];
        
        const csvRows = dataToExport.map(venda => {
            const date = new Date(venda.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); 
            const clienteNome = venda.cliente?.nome || 'Consumidor Final';
            const clienteCpf = venda.cliente?.cpf || '';
            const total = venda.total.toFixed(2).replace('.', ','); 
            const pagamento = venda.pagamento;
            
            const itensList = venda.itens.map(item => 
                `${item.produto.nome} (${item.quantidade} x R$${item.preco.toFixed(2).replace('.', ',')})`
            ).join('; ');
            
            return [
                venda.id, 
                date, 
                clienteNome,
                clienteCpf,
                total, 
                pagamento, 
                `"${itensList}"` 
            ].map(String).join(';');
        });

        const csvString = [
            headers.join(';'),
            ...csvRows
        ].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `relatorio_vendas_pagina_${currentPage}_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Seu navegador não suporta download automático.');
        }
    };

    const handleReprint = (venda: Venda) => setSelectedSale(venda);
    const handleCloseReprint = () => setSelectedSale(null);

    return (
        <>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-brand-dark mb-6">Histórico de Vendas</h1>
                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                    <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                             <input 
                                type="text" 
                                placeholder="Buscar por cliente ou data" 
                                className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-brand-green focus:ring-brand-green"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); 
                                }} 
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <ActionIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="text-gray-400" />
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 font-bold text-gray-700 transition-colors hover:bg-gray-300 w-full sm:w-auto"
                        >
                            <ActionIcon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
                            Gerar Relatório (CSV)
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="text-center p-10">Carregando histórico...</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pagamento</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {vendas.map((venda) => (
                                        <tr key={venda.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(venda.createdAt).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{venda.cliente?.nome || 'Consumidor Final'}</div>
                                                {venda.cliente?.cpf && <div className="text-xs text-gray-500">{venda.cliente.enderecoRua}, {venda.cliente.enderecoCidade}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-green">R$ {venda.total.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{venda.pagamento}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleReprint(venda)} className="text-gray-400 hover:text-blue-600" title="Reimprimir Nota">
                                                    <ActionIcon path="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m0 0l-4 4m4-4l4 4m-4 4V9a2 2 0 012-2h4a2 2 0 012 2v8m-4-4h.01" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalSales)}</span> de <span className="font-medium">{totalSales}</span> vendas.
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1 || isLoading} 
                                className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages || isLoading} 
                                className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                    
                    {vendas.length === 0 && !isLoading && (
                        <div className="text-center p-10 text-gray-500 italic">Nenhuma venda encontrada no histórico.</div>
                    )}
                </div>
            </div>
            
            {/* Modal de Reimissão */}
            {selectedSale && (
                <ModalVendaConcluida 
                    isOpen={!!selectedSale}
                    onClose={handleCloseReprint}
                    venda={{
                        ...selectedSale,
                        cliente: selectedSale.cliente ?? undefined, // ⚡ Corrigido aqui
                        itens: selectedSale.itens.map(item => ({
                            produto: { nome: item.produto.nome, preco: item.preco },
                            quantidade: item.quantidade,
                        })),
                    }}
                    isReprint={true}
                />
            )}
        </>
    );
}
