"use client";

import { useState } from 'react';

// Tipos
type Cliente = {
  id: number;
  nome: string;
};
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onFinalize: (saleData: any) => void; // Função para ser chamada ao finalizar
};

// Dados de exemplo de clientes
const mockClientes: Cliente[] = [
  { id: 1, nome: 'João da Silva' },
  { id: 2, nome: 'Maria Oliveira' },
  { id: 3, nome: 'Cliente Final' },
];

export default function ModalFinalizarVenda({ isOpen, onClose, total, onFinalize }: ModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Chama a função passada pelo componente pai (a página de Vendas)
    // com todos os dados da venda coletados neste modal.
    onFinalize({
      total,
      paymentMethod,
      client: selectedClient,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Finalizar Venda</h2>

        {/* Resumo do Valor */}
        <div className="mb-6 bg-brand-light p-4 rounded-md text-center">
          <p className="text-sm text-gray-600">Total a Pagar</p>
          <p className="text-4xl font-bold text-brand-green">R$ {total.toFixed(2)}</p>
        </div>

        {/* Forma de Pagamento */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Forma de Pagamento</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Dinheiro', 'Cartão de Crédito', 'PIX'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`p-4 border rounded-lg text-sm font-semibold transition-all ${
                  paymentMethod === method
                    ? 'bg-brand-green text-white border-brand-green ring-2 ring-green-300'
                    : 'bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Associar Cliente */}
        <div className="mb-8">
           <h3 className="text-lg font-semibold mb-3 text-gray-800">Associar Cliente (Opcional)</h3>
           <div className="flex gap-2">
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
              onChange={(e) => setSelectedClient(mockClientes.find(c => c.id === parseInt(e.target.value)) || null)}
            >
              <option value="">Selecione um cliente...</option>
              {mockClientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
            <button className="whitespace-nowrap px-4 py-2 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50">
              Novo Cliente
            </button>
           </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="px-8 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90">
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
}