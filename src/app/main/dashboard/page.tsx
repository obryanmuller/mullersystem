"use client";

import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registra os componentes do Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
);

// Tipos para os dados que virão da nossa nova API
type KpiData = {
  faturamentoHoje: number;
  vendasRealizadas: number;
  clientesAtendidos: number;
  ticketMedio: number;
};

type VendasSemanaData = {
  labels: string[];
  data: number[];
};

type PagamentoData = {
  nome: string;
  count: number;
};

type TopProdutoData = {
  nome: string;
  vendidos: number;
};

type DashboardData = {
  kpis: KpiData;
  vendasSemana: VendasSemanaData;
  formasPagamento: PagamentoData[];
  produtosMaisVendidos: TopProdutoData[];
};

// Componente para cada Card de KPI
const KpiCard = ({ title, value, isLoading }: { title: string, value: string, isLoading: boolean }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    {isLoading ? (
      <div className="h-8 bg-gray-200 rounded-md animate-pulse mt-1 w-3/4"></div>
    ) : (
      <p className="text-3xl font-bold text-brand-dark mt-1">{value}</p>
    )}
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do dashboard');
        }
        const apiData = await response.json();
        setData(apiData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Preparando os dados para os gráficos
  const salesData = {
    labels: data?.vendasSemana.labels || [],
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: data?.vendasSemana.data || [],
        backgroundColor: '#23a383',
        borderRadius: 4,
      },
    ],
  };

  const paymentMethodsData = {
    labels: data?.formasPagamento.map(p => p.nome) || [],
    datasets: [
      {
        data: data?.formasPagamento.map(p => p.count) || [],
        backgroundColor: ['#23a383', '#262626', '#a3a3a3', '#cccccc'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Dashboard</h1>

      {/* Grid de Cards de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Faturamento (Hoje)" value={`R$ ${data?.kpis.faturamentoHoje.toFixed(2) || '0.00'}`} isLoading={isLoading} />
        <KpiCard title="Vendas Realizadas" value={data?.kpis.vendasRealizadas.toString() || '0'} isLoading={isLoading} />
        <KpiCard title="Clientes Atendidos" value={data?.kpis.clientesAtendidos.toString() || '0'} isLoading={isLoading} />
        <KpiCard title="Ticket Médio" value={`R$ ${data?.kpis.ticketMedio.toFixed(2) || '0.00'}`} isLoading={isLoading} />
      </div>

      {/* Grid de Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Vendas da Semana */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">Vendas da Semana</h2>
          <div className="h-80">
            {isLoading ? <div className="h-full bg-gray-200 rounded-md animate-pulse"></div> : <Bar data={salesData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />}
          </div>
        </div>

        {/* Gráfico de Pagamentos e Produtos Mais Vendidos */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Pagamentos</h2>
            <div className="h-48 flex justify-center items-center">
              {isLoading ? <div className="h-full w-full bg-gray-200 rounded-full animate-pulse"></div> : <Doughnut data={paymentMethodsData} options={{ responsive: true, maintainAspectRatio: false }} />}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Produtos Mais Vendidos</h2>
            {isLoading ? (
              <ul className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => <li key={i} className="h-5 bg-gray-200 rounded-md"></li>)}
              </ul>
            ) : (
              <ul className="space-y-3">
                {data?.produtosMaisVendidos.map((product, index) => (
                  <li key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{product.nome}</span>
                    <span className="font-bold text-brand-dark">{product.vendidos} un.</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}