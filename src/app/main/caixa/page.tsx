// src/app/main/caixa/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Tipos
type Movimentacao = {
  id: number;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  descricao: string;
  dataHora: string;
};

type CaixaData = {
  kpis: {
    totalEntradas: number;
    totalSaidas: number;
    saldoFinal: number;
  };
  grafico: {
    data: string;
    entradas: number;
    saidas: number;
  }[];
  movimentacoes: Movimentacao[];
  periodo: {
    startDate: string;
    endDate: string;
  };
};

const ActionIcon = ({
  path,
  className = '',
}: {
  path: string;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Funções utilitárias
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',')}`;

const todayISO = new Date().toISOString().split('T')[0];
const lastWeekISO = new Date(
  new Date().setDate(new Date().getDate() - 7)
)
  .toISOString()
  .split('T')[0];

export default function CaixaPage() {
  const [data, setData] = useState<CaixaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(lastWeekISO);
  const [endDate, setEndDate] = useState(todayISO);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formType, setFormType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [formValue, setFormValue] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(`/api/caixa?${params.toString()}`);
      if (!response.ok) throw new Error('Falha ao buscar dados do caixa');

      const result: CaixaData = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erro ao buscar dados do caixa:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Recarrega os dados quando o período de datas muda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Gráfico de fluxo de caixa
  const chartData = {
    labels:
      data?.grafico.map((d) =>
        new Date(d.data).toLocaleDateString('pt-BR', {
          month: 'short',
          day: 'numeric',
        })
      ) || [],
    datasets: [
      {
        label: 'Entradas (R$)',
        data: data?.grafico.map((d) => d.entradas) || [],
        backgroundColor: '#23a383',
        stack: 'Stack 0',
      },
      {
        label: 'Saídas (R$)',
        data: data?.grafico.map((d) => d.saidas * -1) || [],
        backgroundColor: '#ef4444',
        stack: 'Stack 0',
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Valor (R$)',
        },
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Math.abs(Number(value)));
          },
        },
      },
    },
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: formType,
          valor: formValue.replace(',', '.'),
          descricao: formDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao registrar movimentação');
      }

      alert('Movimentação registrada com sucesso!');
      setIsFormModalOpen(false);
      setFormValue('');
      setFormDescription('');
      fetchData();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('Erro desconhecido ao registrar movimentação.');
      }
    }
  };

  const handleGenerateReport = () => {
    const dataToExport = data?.movimentacoes ?? [];

    if (dataToExport.length === 0) {
      alert('Não há dados para gerar o relatório no período selecionado.');
      return;
    }

    const headers = ['ID', 'Data/Hora', 'Tipo', 'Valor', 'Descrição'];

    const csvRows = dataToExport.map((mov) => {
      const valor = mov.valor.toFixed(2).replace('.', ',');
      const date = formatDate(mov.dataHora);
      return [mov.id, date, mov.tipo, valor, `"${mov.descricao}"`].join(';');
    });

    const csvString = [headers.join(';'), ...csvRows].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `relatorio_caixa_${data?.periodo.startDate}_a_${data?.periodo.endDate}.csv`;
    link.click();
  };

  return (
    <>
      <div className="w-full">
        <h1 className="text-3xl font-bold text-brand-dark mb-6">
          Controle de Fluxo de Caixa
        </h1>

        {/* Controles e KPIs */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-green focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-green focus:ring-brand-green"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFormType('ENTRADA');
                  setIsFormModalOpen(true);
                }}
                className="flex items-center justify-center rounded-lg bg-brand-green px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity"
              >
                <ActionIcon path="M12 4v16m8-8H4" />
                Entrada
              </button>
              <button
                onClick={() => {
                  setFormType('SAIDA');
                  setIsFormModalOpen(true);
                }}
                className="flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity"
              >
                <ActionIcon path="M20 12H4" />
                Saída
              </button>
            </div>

            {/* Botão de Relatório */}
            <div>
              <button
                onClick={handleGenerateReport}
                className="flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300 w-full"
              >
                <ActionIcon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Linha de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-4 border-t border-gray-100">
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-sm font-medium text-green-700">Total Entradas</p>
              <p className="text-xl font-bold text-green-900">
                {isLoading
                  ? 'R$ 0,00'
                  : formatCurrency(data?.kpis.totalEntradas ?? 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-700">Total Saídas</p>
              <p className="text-xl font-bold text-red-900">
                {isLoading
                  ? 'R$ 0,00'
                  : formatCurrency(data?.kpis.totalSaidas ?? 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-brand-light">
              <p className="text-sm font-medium text-brand-dark">Saldo Final</p>
              <p
                className={`text-xl font-bold ${
                  (data?.kpis.saldoFinal ?? 0) >= 0
                    ? 'text-brand-green'
                    : 'text-red-600'
                }`}
              >
                {isLoading
                  ? 'R$ 0,00'
                  : formatCurrency(data?.kpis.saldoFinal ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico e Tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md h-96">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">
              Fluxo de Caixa (Gráfico Dinâmico)
            </h2>
            {isLoading ? (
              <div className="h-full bg-gray-200 rounded-md animate-pulse" />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">
              Movimentações do Período
            </h2>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-10">Carregando...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        Data
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        Descrição
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.movimentacoes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-4 text-gray-500"
                        >
                          Nenhuma movimentação encontrada.
                        </td>
                      </tr>
                    ) : (
                      data?.movimentacoes.map((mov) => (
                        <tr
                          key={mov.id}
                          className={
                            mov.tipo === 'ENTRADA'
                              ? 'bg-green-50'
                              : 'bg-red-50'
                          }
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            {formatDate(mov.dataHora)}
                          </td>
                          <td className="px-3 py-2">{mov.descricao}</td>
                          <td
                            className={`px-3 py-2 text-right whitespace-nowrap font-bold ${
                              mov.tipo === 'ENTRADA'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {mov.tipo === 'ENTRADA' ? '+' : '-'}{' '}
                            {formatCurrency(mov.valor)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2
              className={`text-2xl font-bold mb-6 ${
                formType === 'ENTRADA' ? 'text-brand-green' : 'text-red-600'
              }`}
            >
              {formType === 'ENTRADA'
                ? 'Registrar Entrada'
                : 'Registrar Saída'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="valor"
                  className="block text-sm font-medium text-gray-700"
                >
                  Valor (R$)
                </label>
                <input
                  type="text"
                  id="valor"
                  value={formValue}
                  onChange={(e) =>
                    setFormValue(e.target.value.replace(/[^0-9,.]/g, ''))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="descricao"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descrição/Motivo
                </label>
                <input
                  type="text"
                  id="descricao"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 font-bold text-white rounded-lg hover:opacity-90 ${
                    formType === 'ENTRADA'
                      ? 'bg-brand-green'
                      : 'bg-red-600'
                  }`}
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
