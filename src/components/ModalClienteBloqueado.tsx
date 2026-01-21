// src/components/ModalClienteBloqueado.tsx
"use client";

import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ModalClienteBloqueadoProps {
  isOpen: boolean;
  onClose: () => void;
  nomeCliente?: string;
}

export default function ModalClienteBloqueado({
  isOpen,
  onClose,
  nomeCliente = 'Cliente',
}: ModalClienteBloqueadoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header com ícone de alerta */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Cliente Bloqueado</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Mensagem */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            O cliente <span className="font-semibold text-gray-900">{nomeCliente}</span> está <span className="font-semibold text-red-600">bloqueado</span> no sistema por ter pendências em atraso.
          </p>
          <p className="text-gray-600 text-sm mt-3">
            Para poder fazer novas vendas a prazo para este cliente, é necessário regularizar todas as contas em atraso na aba de <span className="font-semibold">Pendências</span>.
          </p>
        </div>

        {/* Box de informação */}
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Ação necessária:</span> Acesse a aba de Pendências e regularize os pagamentos em atraso.
          </p>
        </div>

        {/* Botão */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
