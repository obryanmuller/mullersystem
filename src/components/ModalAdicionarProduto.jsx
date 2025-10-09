// src/components/ModalAdicionarProduto.jsx
"use client";

export default function ModalAdicionarProduto({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    console.log("Novo produto:", data); // Por enquanto, só exibimos no console
    onClose(); // Fecha o modal após submeter
  };

  return (
    // Fundo escuro do modal (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Conteúdo do modal */}
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Novo Produto</h2>
        <form onSubmit={handleSubmit}>
          {/* Campo Nome */}
          <div className="mb-4">
            <label htmlFor="nome" className="block text-gray-700 font-semibold mb-2">Nome do Produto</label>
            <input type="text" id="nome" name="nome" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          {/* Campos SKU e Preço em linha */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="sku" className="block text-gray-700 font-semibold mb-2">SKU</label>
              <input type="text" id="sku" name="sku" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="w-1/2">
              <label htmlFor="preco" className="block text-gray-700 font-semibold mb-2">Preço (R$)</label>
              <input type="number" step="0.01" id="preco" name="preco" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          
          {/* Campo Quantidade */}
          <div className="mb-6">
            <label htmlFor="quantidade" className="block text-gray-700 font-semibold mb-2">Quantidade em Estoque</label>
            <input type="number" id="quantidade" name="quantidade" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}