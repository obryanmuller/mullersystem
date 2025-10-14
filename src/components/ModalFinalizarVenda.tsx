"use client";

import { useState, useEffect } from 'react';
import ModalAdicionarCliente from './ModalAdicionarCliente'; 

type Cliente = {
  id: number;
  nome: string;
};

type SaleFinalizationData = {
  total: number;
  paymentMethod: string;
  client: Cliente | null;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onFinalize: (saleData: SaleFinalizationData) => void;
};

export default function ModalFinalizarVenda({ isOpen, onClose, total, onFinalize }: ModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false); 
  const [allClients, setAllClients] = useState<Cliente[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
        const response = await fetch('/api/clientes');
        if(response.ok) {
            const data = await response.json();
            setAllClients(data);
        } else {
            console.error("Falha ao buscar clientes");
        }
    } catch (error) {
        console.error("Erro na requisição de clientes:", error);
    } finally {
        setIsLoadingClients(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
        fetchClients();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (paymentMethod === 'A Prazo' && !selectedClient) {
      alert('⚠️ Para pagamentos "A Prazo", é obrigatório selecionar um cliente.');
      return;
    }
    const saleData: SaleFinalizationData = {
        total,
        paymentMethod,
        client: selectedClient,
    };
    onFinalize(saleData);
  };

  const filteredClients = allClients.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectClient = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setSearchTerm(cliente.nome);
    setShowResults(false);
  };

  const paymentMethods = ['Dinheiro', 'Cartão', 'PIX', 'A Prazo'];
  const isClientRequired = paymentMethod === 'A Prazo';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
          {/* O JSX do modal principal continua o mesmo */}
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Finalizar Venda</h2>
          <div className="mb-6 bg-brand-light p-4 rounded-md text-center"><p className="text-sm text-gray-600">Total a Pagar</p><p className="text-4xl font-bold text-brand-green">R$ {total.toFixed(2)}</p></div>
          <div className="mb-6"><h3 className="text-lg font-semibold mb-3 text-gray-800">Forma de Pagamento</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{paymentMethods.map((method) => (<button key={method} onClick={() => setPaymentMethod(method)} className={`p-4 border rounded-lg text-sm font-semibold transition-all ${paymentMethod === method ? 'bg-brand-green text-white border-brand-green ring-2 ring-green-300' : 'bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}>{method}</button>))}</div></div>
          <div className="mb-8 z-10"><h3 className="text-lg font-semibold mb-3 text-gray-800">Associar Cliente {isClientRequired && <span className="text-red-500 font-bold"> (Obrigatório)</span>}{!isClientRequired && <span className="text-gray-500 font-normal"> (Opcional)</span>}</h3><div className="flex gap-2"><div className="relative w-full"><input type="text" placeholder={isLoadingClients ? "Carregando clientes..." : "Pesquisar ou Selecionar Cliente..."} value={searchTerm} disabled={isLoadingClients} onChange={(e) => {setSearchTerm(e.target.value); if(e.target.value) setShowResults(true); setSelectedClient(null);}} onFocus={() => setShowResults(true)} onBlur={() => setTimeout(() => setShowResults(false), 200)} className={`w-full rounded-md shadow-sm pr-10 transition-all focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green border-gray-300 bg-white p-2.5 ${isClientRequired && !selectedClient ? 'border-red-500 ring-1 ring-red-500' : ''}`}/>{showResults && searchTerm.length > 0 && (<ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-20">{filteredClients.length > 0 ? (filteredClients.map(cliente => (<li key={cliente.id} onMouseDown={() => handleSelectClient(cliente)} className="p-3 cursor-pointer hover:bg-brand-light transition-colors text-sm">{cliente.nome}</li>))) : (<li className="p-3 text-gray-500 text-sm">Nenhum cliente encontrado.</li>)}</ul>)}</div><button type="button" onClick={() => setIsClientModalOpen(true)} className="whitespace-nowrap px-4 py-2 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50">Novo Cliente</button></div>{selectedClient && (<p className="mt-2 text-sm text-brand-green font-semibold">Cliente Selecionado: {selectedClient.nome}</p>)}</div>
          <div className="flex justify-end gap-4"><button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button><button onClick={handleConfirm} className="px-8 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90">Confirmar Pagamento</button></div>
        </div>
      </div>

      {/* CORRIGIDO */}
      <ModalAdicionarCliente
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientAdded={() => {
            setIsClientModalOpen(false);
            fetchClients(); // Atualiza a lista de clientes para incluir o novo
        }}
      />
    </>
  );
}