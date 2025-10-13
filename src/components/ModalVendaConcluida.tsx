"use client";

import CupomNaoFiscal from './CupomNaoFiscal';

// --- Tipos ---
type CartItem = { 
    produto: { nome: string; preco: number; }; 
    quantidade: number; 
};

// CORREÇÃO: O tipo 'cliente' agora espera o objeto completo, assim como no CupomNaoFiscal
type ClienteCompleto = {
    nome: string;
    cpf: string;
    enderecoRua: string;
    enderecoBairro: string;
    enderecoCidade: string;
    enderecoEstado: string;
};

type Venda = {
  id: number;
  itens: CartItem[];
  total: number;
  pagamento: string;
  cliente?: ClienteCompleto; // Usando o tipo completo e correto
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  venda: Venda;
};

export default function ModalVendaConcluida({ isOpen, onClose, venda }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* O modal que o usuário vê */}
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
          <svg className="mx-auto h-16 w-16 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mt-4 text-brand-dark">Venda Concluída!</h2>
          <p className="text-gray-600 mt-2">A venda foi registrada com sucesso.</p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => window.print()}
              className="px-8 py-3 bg-brand-green text-white font-bold rounded-lg hover:opacity-90 w-full"
            >
              Imprimir Comprovante
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
            >
              Nova Venda
            </button>
          </div>
        </div>
      </div>
      
      {/* O componente do cupom continua aqui, invisível, para ser impresso */}
      <div className="print-only">
        {venda && <CupomNaoFiscal {...venda} />}
      </div>
    </>
  );
}