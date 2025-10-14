// obryanmuller/mullersystem/mullersystem-72aa8aafde1da53f599f9c5c84aac0698a9390fe/src/components/ModalAdicionarProduto.jsx
"use client";

export default function ModalAdicionarProduto({ isOpen, onClose, onProductAdded }) {
  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao adicionar produto');
      }
      
      if (onProductAdded) {
        onProductAdded();
      }
      onClose(); 
    } catch (error) {
      console.error(error);
      alert(`Erro ao salvar produto: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Novo Produto</h2>
        <form onSubmit={handleSubmit}>
          {/* Nome do Produto */}
          <div className="mb-4">
            <label htmlFor="nome" className="block text-gray-700 font-semibold mb-2">Nome do Produto</label>
            <input type="text" id="nome" name="nome" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required />
          </div>
          
          {/* SKU e Preço */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="sku" className="block text-gray-700 font-semibold mb-2">SKU</label>
              <input type="text" id="sku" name="sku" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required />
            </div>
            <div className="w-1/2">
              <label htmlFor="preco" className="block text-gray-700 font-semibold mb-2">Preço (R$)</label>
              <input type="number" step="0.01" id="preco" name="preco" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required />
            </div>
          </div>
          
          {/* Quantidade em Estoque e Qtd. Mínima */}
          <div className="flex gap-4 mb-6"> 
            <div className="w-1/2">
              <label htmlFor="quantidade" className="block text-gray-700 font-semibold mb-2">Qtd. Estoque</label>
              <input type="number" id="quantidade" name="quantidade" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required />
            </div>
            <div className="w-1/2"> 
              <label htmlFor="estoqueMinimo" className="block text-gray-700 font-semibold mb-2">Qtd. Mínima (Alerta)</label>
              <input 
                type="number" 
                id="estoqueMinimo" 
                name="estoqueMinimo" 
                defaultValue={10} 
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" 
                required 
              />
            </div>
          </div>
          
          {/* Botões */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}