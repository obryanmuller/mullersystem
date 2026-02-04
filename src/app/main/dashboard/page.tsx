"use client";

import { useState, useEffect } from 'react';
import { FiPackage } from 'react-icons/fi';
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
  ChartData,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import ModalAlertaEstoque from '@/components/ModalAlertaEstoque';

// Registra os componentes do Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
);

type ProdutoAlerta = { 
  id: number; 
  nome: string; 
  sku: string; 
  quantidade: number;
  estoqueMinimo: number;
};

type KpiData = {
  faturamentoHoje: number;
  vendasRealizadas: number;
  ticketMedio: number;
  contasAReceber: number;
};

type VendasSemanaData = { labels: string[]; data: number[]; };
type PagamentoData = { nome: string; count: number; };
type TopProdutoData = { nome: string; vendidos: number; };
type TopClienteData = { nome: string; totalCompras: number; };

type DashboardData = {
  kpis: KpiData;
  vendasSemana: VendasSemanaData;
  formasPagamento: PagamentoData[];
  produtosMaisVendidos: TopProdutoData[];
  lowStockProducts: ProdutoAlerta[];
  outOfStockProducts: ProdutoAlerta[];
  topClientes: TopClienteData[];
};

type ModalState = {
  isOpen: boolean;
  title: string;
  products: ProdutoAlerta[];
};

// Componente de KPI Card
const KpiCard = ({ title, value, isLoading, className = '' }: { title: string, value: string, isLoading: boolean, className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
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
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    products: [],
  });

  type ProdutoInfo = {
    id: number;
    nome: string;
    sku: string;
    preco: number;
    quantidade: number;
    estoqueMinimo: number;
    createdAt?: string;
  };

  const [queryCode, setQueryCode] = useState('');
  const [produtoInfo, setProdutoInfo] = useState<ProdutoInfo | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleLookup = async (e?: any) => {
    if (e?.preventDefault) e.preventDefault();
    setLookupError('');
    setProdutoInfo(null);
    if (!queryCode.trim()) {
      setLookupError('Digite o SKU ou ID do produto');
      return;
    }
    setIsLookupLoading(true);
    try {
      // Tenta por SKU primeiro
      const skuResponse = await fetch(`/api/produtos?sku=${encodeURIComponent(queryCode.trim())}`);
      if (skuResponse.ok) {
        const prod = await skuResponse.json();
        setProdutoInfo(prod);
        setIsProductModalOpen(true);
        return;
      }
      // Tenta por ID caso o valor seja numérico
      if (/^\d+$/.test(queryCode.trim())) {
        const id = parseInt(queryCode.trim(), 10);
        const idResponse = await fetch(`/api/produtos/${id}`);
        if (idResponse.ok) {
          const prod = await idResponse.json();
          setProdutoInfo(prod);
          setIsProductModalOpen(true);
          return;
        }
      }
      setLookupError('Produto não encontrado');
    } catch (error) {
      console.error(error);
      setLookupError('Erro ao buscar produto');
    } finally {
      setIsLookupLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do dashboard');
        }
        const apiData: DashboardData = await response.json();
        setData(apiData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica para o Gráfico de Estoque ---
  const lowStockCount = data?.lowStockProducts.length || 0;
  const outOfStockCount = data?.outOfStockProducts.length || 0;
  const hasStockIssues = lowStockCount > 0 || outOfStockCount > 0;

  let labels: string[] = [];
  let dataPoints: number[] = [];
  let colors: string[] = [];

  if (lowStockCount > 0) {
    labels.push('Baixo Estoque');
    dataPoints.push(lowStockCount);
    colors.push('#f59e0b');
  }
  if (outOfStockCount > 0) {
    labels.push('Esgotado');
    dataPoints.push(outOfStockCount);
    colors.push('#ef4444');
  }

  if (!hasStockIssues) {
    labels = ['Sem Problemas de Estoque'];
    dataPoints = [1];
    colors = ['#23a383'];
  }

  const stockData: ChartData<'doughnut'> = {
    labels: labels,
    datasets: [
      {
        data: dataPoints,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const handleChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
    if (!elements.length || !data || !hasStockIssues) return;

    const clickedLabel = stockData.labels?.[elements[0].index];

    if (clickedLabel === 'Baixo Estoque' && lowStockCount > 0) {
      setModalState({
        isOpen: true,
        title: 'Produtos em Alerta de Estoque',
        products: data.lowStockProducts,
      });
    } else if (clickedLabel === 'Esgotado' && outOfStockCount > 0) {
      setModalState({
        isOpen: true,
        title: 'Produtos Esgotados (Qtd: 0)',
        products: data.outOfStockProducts,
      });
    }
  };

  // --- Gráficos e KPIs ---
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

  const kpisToRender = [
    { title: "Faturamento (Hoje)", value: `R$ ${data?.kpis.faturamentoHoje.toFixed(2) || '0.00'}`, isLoading },
    { title: "Vendas Realizadas", value: data?.kpis.vendasRealizadas.toString() || '0', isLoading },
    { title: "Ticket Médio", value: `R$ ${data?.kpis.ticketMedio.toFixed(2) || '0.00'}`, isLoading },
  ];

  return (
    <>
      <div className="w-full">
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {kpisToRender.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vendas da Semana */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-dark mb-2">Vendas da Semana</h2>
            <div className="h-64">
              {isLoading ? (
                <div className="h-full bg-gray-200 rounded-md animate-pulse"></div>
              ) : (
                <Bar
                  data={salesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              )}
            </div>
          </div>

          {/* Saúde do Estoque */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-xl font-semibold text-brand-dark mb-2">Saúde do Estoque</h2>
            <div className="h-64 w-full flex justify-center items-center">
              {isLoading ? (
                <div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse"></div>
              ) : (
                <Doughnut
                  data={stockData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    onClick: handleChartClick,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const count = context.raw as number;
                            if (!hasStockIssues && label === 'Sem Problemas de Estoque') {
                              return label;
                            }
                            if (label !== 'Sem Problemas de Estoque' && count > 0) {
                              return `${label}: ${count} produtos`;
                            }
                          },
                        },
                      },
                      legend: {
                        display: true,
                        position: 'bottom',
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Pagamentos */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-xl font-semibold text-brand-dark mb-2">Pagamentos</h2>
            <div className="h-64 w-full flex justify-center items-center">
              {isLoading ? (
                <div className="w-40 h-40 bg-gray-200 rounded-full animate-pulse"></div>
              ) : (
                <Doughnut
                  data={paymentMethodsData}
                  options={{ responsive: true, maintainAspectRatio: true }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Terceira Linha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Contas a Receber */}
          <KpiCard
            title="Contas a Receber (A Prazo)"
            value={`R$ ${data?.kpis.contasAReceber.toFixed(2) || '0.00'}`}
            isLoading={isLoading}
            className="lg:col-span-1 border-2 border-red-500"
          />

          {/* Produtos Mais Vendidos */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-dark mb-2">Produtos Mais Vendidos</h2>
            {isLoading ? (
              <ul className="space-y-2 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="h-5 bg-gray-200 rounded-md"></li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {data?.produtosMaisVendidos.slice(0, 4).map((product, index) => (
                  <li key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{product.nome}</span>
                    <span className="font-bold text-brand-dark">{product.vendidos} un.</span>
                  </li>
                ))}
                {data?.produtosMaisVendidos.length === 0 && (
                  <li className="text-gray-500 text-center py-2">
                    Nenhum produto vendido recentemente.
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Consulta de Preço */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-dark mb-2">Consulta de Preço</h2>
            <form onSubmit={handleLookup} className="flex items-center space-x-2">
              <input
                type="text"
                value={queryCode}
                onChange={(e) => setQueryCode(e.target.value)}
                placeholder="Código do produto (SKU ou ID)"
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-dark text-white rounded"
                disabled={isLookupLoading}
              >{isLookupLoading ? 'Buscando...' : 'Buscar'}</button>
            </form>
            {lookupError && <p className="text-red-500 mt-2">{lookupError}</p>}
            {produtoInfo && !isProductModalOpen && (
              <div className="mt-3 p-2 border rounded bg-gray-50">
                <p className="text-sm font-semibold">{produtoInfo.nome}</p>
                <p className="text-sm">SKU: {produtoInfo.sku}</p>
                <p className="text-sm font-bold">R$ {produtoInfo.preco.toFixed(2)}</p>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="mt-2 text-sm text-brand-dark underline"
                >Ver detalhes</button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Produto */}
        {isProductModalOpen && produtoInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="bg-brand-green/10 text-brand-green rounded-full p-2">
                    <FiPackage className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-brand-dark">{produtoInfo.nome}</h3>
                    <p className="text-sm text-gray-500">SKU: {produtoInfo.sku}</p>
                  </div>
                </div>

                <button onClick={() => { setIsProductModalOpen(false); setProdutoInfo(null); }} className="text-gray-500 hover:text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Preço</p>
                  <p className="text-lg font-bold text-brand-dark">R$ {produtoInfo.preco.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Quantidade</p>
                  <p className="text-lg font-bold">{produtoInfo.quantidade}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Estoque mínimo</p>
                  <p className="text-lg">{produtoInfo.estoqueMinimo}</p>
                </div>

                {produtoInfo.createdAt && (
                  <div>
                    <p className="text-sm text-gray-500">Criado em</p>
                    <p className="text-sm text-gray-700">{new Date(produtoInfo.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => { setIsProductModalOpen(false); setProdutoInfo(null); }} className="px-4 py-2 bg-gray-200 rounded">Fechar</button>
                <button onClick={() => { setIsProductModalOpen(false); }} className="px-4 py-2 bg-brand-green text-white font-bold rounded">Ok</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Estoque */}
        <ModalAlertaEstoque
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          title={modalState.title}
          products={modalState.products}
        />
      </div> {/* <-- fechamento do div principal */}
    </>
  );
}
