"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import ModalFinalizarVenda from "@/components/ModalFinalizarVenda";
import ModalVendaConcluida from "@/components/ModalVendaConcluida";

// Tipos
type Produto = { id: number; nome: string; sku: string; preco: number; quantidade: number };
type CartItem = { produto: Produto; quantidade: number };
type Venda = {
  id: number;
  itens: CartItem[];
  total: number;
  pagamento: string;
  cliente?: string;
};

// NOVO TIPO: Define o formato do objeto que é retornado por onFinalize
type SaleFinalizationData = {
    total: number;
    paymentMethod: string;
    // O cliente é opcional e pode ser null, mas se existir, deve ter o campo nome
    client: { nome?: string | undefined } | null;
};

// Mock
const mockProdutos: Produto[] = [
  { id: 1, nome: "Teclado Mecânico RGB", sku: "TEC-001", preco: 250.5, quantidade: 30 },
  { id: 2, nome: "Mouse Gamer 16000 DPI", sku: "MOU-002", preco: 180.0, quantidade: 50 },
  { id: 3, nome: 'Monitor Ultrawide 29"', sku: "MON-003", preco: 1200.75, quantidade: 15 },
  { id: 4, nome: "Headset 7.1 Surround", sku: "HEA-004", preco: 350.0, quantidade: 8 },
  { id: 5, nome: "Webcam Full HD 1080p", sku: "CAM-005", preco: 450.0, quantidade: 0 },
  { id: 6, nome: "SSD NVMe 1TB", sku: "SSD-006", preco: 650.0, quantidade: 22 },
];

export default function VendasPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<Venda | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const addToCart = (produto: Produto) => {
    if (produto.quantidade <= 0) {
      alert(`O produto "${produto.nome}" está fora de estoque!`);
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.produto.id === produto.id);
      if (existing) {
        return prev.map((item) =>
          item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setCartItems((prev) => prev.filter((item) => item.produto.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.produto.id === productId ? { ...item, quantidade: newQuantity } : item
      )
    );
  };

  const productSuggestions = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return mockProdutos
      .filter(
        (p) =>
          p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 8);
  }, [searchTerm]);

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (productSuggestions.length === 1) {
        addToCart(productSuggestions[0]);
      } else if (productSuggestions.length === 0 && searchTerm.length >= 2) {
        alert("Nenhum produto encontrado. Tente refinar a busca.");
      }
    }
  };

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0),
    [cartItems]
  );

  const total = useMemo(() => Math.max(subtotal - discount, 0), [subtotal, discount]);

  // FIX: Usando useCallback para estabilizar a função
  const handleNewSale = useCallback(() => {
    setCartItems([]);
    setDiscount(0);
    setLastSaleData(null);
    setIsSuccessModalOpen(false);
  }, []); // Dependências vazias

  // FIX: Usando SaleFinalizationData para tipagem
  const handleFinalizeSale = (saleData: SaleFinalizationData) => {
    setLastSaleData({
      id: Math.floor(Math.random() * 10000),
      itens: cartItems,
      total: saleData.total,
      pagamento: saleData.paymentMethod,
      cliente: saleData.client?.nome,
    });
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  // FIX: Usando useCallback para estabilizar a função
  const handleCancelSale = useCallback(() => {
    if (cartItems.length > 0 && window.confirm("Tem certeza que deseja cancelar a venda atual?")) {
      handleNewSale();
    }
  }, [cartItems.length, handleNewSale]); // Depende do tamanho do carrinho e de handleNewSale

  // 🔥 Hotkeys corrigidas (adicionando handleCancelSale nas dependências do useEffect)
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "F1") {
        event.preventDefault();
        if (cartItems.length > 0 && !isPaymentModalOpen && !isSuccessModalOpen)
          setIsPaymentModalOpen(true);
      }
      if (event.key === "F10") {
        event.preventDefault();
        if (!isPaymentModalOpen && !isSuccessModalOpen) handleCancelSale();
      }
    };

    window.addEventListener("keydown", handleKey);
    // FIX: Adicionado handleCancelSale para evitar o warning do linter
    return () => window.removeEventListener("keydown", handleKey);
  }, [cartItems, isPaymentModalOpen, isSuccessModalOpen, handleCancelSale]); 

  return (
    <>
      <div className="flex h-full flex-col">
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Frente de Caixa</h1>

        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
          {/* 🧾 Tabela de Itens */}
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Unit.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <tr key={item.produto.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.produto.nome}</div>
                          <div className="text-sm text-gray-500">{item.produto.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) =>
                              updateQuantity(item.produto.id, parseInt(e.target.value))
                            }
                            className="w-20 rounded-md border-gray-300 text-center text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          R$ {item.produto.preco.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800">
                          R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-gray-400 text-sm italic">
                        Aguardando produtos...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 💰 Resumo da Venda */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-brand-dark mb-4">Resumo da Venda</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <label htmlFor="discount">Descontos</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      R$
                    </span>
                    <input
                      id="discount"
                      type="number"
                      value={discount === 0 ? "" : discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-28 rounded-md border-gray-300 pl-8 pr-2 py-1 text-right focus:border-brand-green focus:ring-brand-green"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between text-2xl font-bold text-brand-dark">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col justify-end">
              <div className="space-y-3">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={cartItems.length === 0}
                  className="w-full rounded-lg bg-brand-green py-4 text-lg font-bold text-white shadow hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Finalizar Venda (F1)
                </button>
                <button
                  onClick={handleCancelSale}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancelar Venda (F10)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Input de busca com autocomplete */}
        <footer className="mt-6 relative">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleSearchEnter}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Digite o nome ou SKU do produto e pressione Enter"
              className="w-full rounded-lg border-gray-300 p-4 pl-12 text-lg shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                className="h-6 w-6 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {showSuggestions && productSuggestions.length > 0 && (
              <ul className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                {productSuggestions.map((product) => (
                  <li
                    key={product.id}
                    onMouseDown={() => addToCart(product)}
                    className="p-3 border-b border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors text-sm"
                  >
                    <div className="font-semibold text-gray-800">{product.nome}</div>
                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                      <span>SKU: {product.sku}</span>
                      <span
                        className={
                          product.quantidade <= 0 ? "text-red-500 font-bold" : "text-green-600"
                        }
                      >
                        Estoque: {product.quantidade}
                      </span>
                      <span className="font-bold text-brand-green">
                        R$ {product.preco.toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </footer>
      </div>

      <ModalFinalizarVenda
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onFinalize={handleFinalizeSale}
        total={total}
      />

      {lastSaleData && (
        <ModalVendaConcluida
          isOpen={isSuccessModalOpen}
          onClose={handleNewSale}
          venda={lastSaleData}
        />
      )}
    </>
  );
}