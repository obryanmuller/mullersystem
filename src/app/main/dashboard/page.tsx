"use client";

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

// Registra os componentes necessários para os gráficos funcionarem
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Componente para cada Card de KPI (pode ser movido para um arquivo separado no futuro)
const KpiCard = ({ title, value }: { title: string, value: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-brand-dark mt-1">{value}</p>
  </div>
);

// Dados de Exemplo para os Gráficos
const salesData = {
  labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Faturamento (R$)',
      data: [1250, 1900, 3000, 2200, 4500, 5200, 1500],
      backgroundColor: '#23a383', // Usando a cor brand-green
      borderRadius: 4,
    },
  ],
};

const paymentMethodsData = {
  labels: ['Cartão de Crédito', 'PIX', 'Dinheiro'],
  datasets: [
    {
      data: [65, 25, 10], // Em porcentagem
      backgroundColor: ['#23a383', '#262626', '#a3a3a3'], // Cores da marca
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
};

const topProducts = [
  { nome: 'Monitor Ultrawide 29"', vendidos: 15 },
  { nome: 'Teclado Mecânico RGB', vendidos: 12 },
  { nome: 'Mouse Gamer 16000 DPI', vendidos: 10 },
  { nome: 'Headset 7.1 Surround', vendidos: 8 },
];

export default function DashboardPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Dashboard</h1>

      {/* Grid de Cards de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Faturamento (Hoje)" value="R$ 1.981,25" />
        <KpiCard title="Vendas Realizadas" value="4" />
        <KpiCard title="Clientes Atendidos" value="3" />
        <KpiCard title="Ticket Médio" value="R$ 495,31" />
      </div>

      {/* Grid de Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Vendas da Semana (ocupa 2/3 do espaço) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">Vendas da Semana</h2>
          <div className="h-80"> {/* Define uma altura fixa para o gráfico */}
            <Bar
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        {/* Gráfico de Pagamentos e Produtos Mais Vendidos (ocupa 1/3) */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Pagamentos</h2>
            <div className="h-48 flex justify-center items-center">
              <Doughnut data={paymentMethodsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Produtos Mais Vendidos</h2>
            <ul className="space-y-3">
              {topProducts.map((product, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{product.nome}</span>
                  <span className="font-bold text-brand-dark">{product.vendidos} un.</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}