// src/app/main/pendencia/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';

type Pendencia = {
  id: number;
  vendaId: number;
  clienteId: number;
  valor: number;
  descricao: string;
  dataPendencia: string;
  dataVencimento: string | null;
  dataPago: string | null;
  status: 'ABERTA' | 'PAGA' | 'ATRASADA';
  cliente: {
    nome: string;
    email: string;
  };
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',')}`;

const getStatusBadge = (status: string, dataVencimento: string | null) => {
  if (status === 'PAGA') {
    return <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Paga</span>;
  }
  
  if (status === 'ATRASADA' || (dataVencimento && new Date(dataVencimento) < new Date() && status === 'ABERTA')) {
    return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1"><FiAlertCircle size={14} /> Atrasada</span>;
  }
  
  return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold flex items-center gap-1"><FiClock size={14} /> Aberta</span>;
};

export default function PendenciaPage() {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'TODAS' | 'ABERTAS' | 'PAGAS' | 'ATRASADAS'>('TODAS');

  const fetchPendencias = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pendencias?filter=${filter}`);
      if (!response.ok) throw new Error('Falha ao buscar pendências');
      const data = await response.json();
      setPendencias(data);
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPendencias();
  }, [fetchPendencias]);

  const handleMarcarPago = async (id: number) => {
    if (!confirm('Confirmar pagamento desta pendência?')) return;

    try {
      const response = await fetch(`/api/pendencias/${id}/pagar`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Falha ao marcar como pago');
      
      alert('Pendência marcada como paga!');
      fetchPendencias();
    } catch (error) {
      alert('Erro ao marcar como pago');
      console.error(error);
    }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta pendência?')) return;

    try {
      const response = await fetch(`/api/pendencias/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao cancelar pendência');
      
      alert('Pendência cancelada!');
      fetchPendencias();
    } catch (error) {
      alert('Erro ao cancelar pendência');
      console.error(error);
    }
  };

  const filteredPendencias = pendencias.filter(p => {
    if (filter === 'TODAS') return true;
    if (filter === 'ABERTAS') return p.status === 'ABERTA';
    if (filter === 'PAGAS') return p.status === 'PAGA';
    if (filter === 'ATRASADAS') {
      return p.status === 'ATRASADA' || (p.dataVencimento && new Date(p.dataVencimento) < new Date() && p.status === 'ABERTA');
    }
    return true;
  });

  const totalPendente = filteredPendencias
    .filter(p => p.status === 'ABERTA' || p.status === 'ATRASADA')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPago = filteredPendencias
    .filter(p => p.status === 'PAGA')
    .reduce((sum, p) => sum + p.valor, 0);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Contas a Receber</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-700">Total Pendente</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPendente)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-700">Total Recebido</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-700">Total Geral</p>
          <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totalPendente + totalPago)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex gap-2 flex-wrap">
        {(['TODAS', 'ABERTAS', 'PAGAS', 'ATRASADAS'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'ABERTAS' && 'Abertas'}
            {f === 'PAGAS' && 'Pagas'}
            {f === 'ATRASADAS' && 'Atrasadas'}
            {f === 'TODAS' && 'Todas'}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Descrição</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700">Valor</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Vencimento</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredPendencias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma pendência encontrada
                  </td>
                </tr>
              ) : (
                filteredPendencias.map(pendencia => (
                  <tr key={pendencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{pendencia.cliente.nome}</p>
                        <p className="text-xs text-gray-500">{pendencia.cliente.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{pendencia.descricao}</td>
                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(pendencia.valor)}</td>
                    <td className="px-6 py-4">
                      {pendencia.dataVencimento ? formatDate(pendencia.dataVencimento) : 'Sem data'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pendencia.status, pendencia.dataVencimento)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {pendencia.status !== 'PAGA' && (
                          <button
                            onClick={() => handleMarcarPago(pendencia.id)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="Marcar como pago"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelar(pendencia.id)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Cancelar pendência"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
