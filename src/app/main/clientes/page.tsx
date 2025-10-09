"use client";

import { useState } from 'react';

// Ainda não criamos este modal, mas já vamos deixar o código pronto para usá-lo
// import ModalAdicionarCliente from '@/components/ModalAdicionarCliente';

const ActionIcon = ({ path }: { path: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d={path} />
  </svg>
);

export default function ClientesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de exemplo para clientes
  const mockClientes = [
    { id: 1, nome: 'João da Silva', email: 'joao.silva@email.com', telefone: '(11) 98765-4321', status: 'Ativo' },
    { id: 2, nome: 'Maria Oliveira', email: 'maria.o@email.com', telefone: '(21) 91234-5678', status: 'Ativo' },
    { id: 3, nome: 'Carlos Pereira', email: 'carlos.pereira@email.com', telefone: '(31) 99999-8888', status: 'Inativo' },
    { id: 4, nome: 'Ana Costa', email: 'ana.costa@email.com', telefone: '(41) 98888-7777', status: 'Ativo' },
  ];

  const filteredClientes = mockClientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'Ativo') {
      return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Ativo</span>;
    }
    return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">Inativo</span>;
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark">Gestão de Clientes</h1>
          <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2 font-bold text-white shadow transition-transform transform hover:scale-105 hover:opacity-90"
            >
              Adicionar Cliente
            </button>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Telefone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{cliente.nome}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">{cliente.email}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">{cliente.telefone}</td>
                  <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(cliente.status)}</td>
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

      {/* <ModalAdicionarCliente
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> 
      */}
    </>
  );
}