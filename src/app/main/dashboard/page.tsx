export default function DashboardPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-2">Bem-vindo ao seu painel de controle!</p>
      </header>

      {/* Futuramente, aqui podemos adicionar cards, gráficos, etc. */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700">Visão Geral</h2>
        <p className="mt-4">Em breve, você verá as principais métricas do seu negócio aqui.</p>
      </div>
    </div>
  );
}