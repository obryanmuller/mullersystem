// src/components/ModalConfirmacao.tsx
"use client";

import { FiAlertCircle, FiCheckCircle, FiTrash2 } from 'react-icons/fi';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  tipo: 'confirmar' | 'sucesso' | 'erro' | 'deletar';
  acao?: 'pagar' | 'deletar' | null;
  textoBotaoPrimario?: string;
  textoBotaoSecundario?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const getIconeECores = (tipo: string, acao?: string | null) => {
  if (acao === 'pagar') {
    return {
      icone: <FiCheckCircle className="w-6 h-6" />,
      corFundo: 'bg-green-100',
      corTexto: 'text-green-600',
      corBotaoPrimario: 'bg-green-600 hover:bg-green-700',
    };
  }
  
  switch (tipo) {
    case 'deletar':
      return {
        icone: <FiTrash2 className="w-6 h-6" />,
        corFundo: 'bg-red-100',
        corTexto: 'text-red-600',
        corBotaoPrimario: 'bg-red-600 hover:bg-red-700',
      };
    case 'sucesso':
      return {
        icone: <FiCheckCircle className="w-6 h-6" />,
        corFundo: 'bg-green-100',
        corTexto: 'text-green-600',
        corBotaoPrimario: 'bg-green-600 hover:bg-green-700',
      };
    case 'erro':
      return {
        icone: <FiAlertCircle className="w-6 h-6" />,
        corFundo: 'bg-red-100',
        corTexto: 'text-red-600',
        corBotaoPrimario: 'bg-red-600 hover:bg-red-700',
      };
    default:
      return {
        icone: <FiAlertCircle className="w-6 h-6" />,
        corFundo: 'bg-blue-100',
        corTexto: 'text-blue-600',
        corBotaoPrimario: 'bg-blue-600 hover:bg-blue-700',
      };
  }
};

export default function ModalConfirmacao({
  isOpen,
  titulo,
  mensagem,
  tipo = 'confirmar',
  acao = null,
  textoBotaoPrimario = 'Confirmar',
  textoBotaoSecundario = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
}: ModalConfirmacaoProps) {
  if (!isOpen) return null;

  const { icone, corFundo, corTexto, corBotaoPrimario } = getIconeECores(tipo, acao);
  const mostrarBotaoSecundario = tipo !== 'sucesso' && tipo !== 'erro';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        {/* Ícone e Título */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 ${corFundo} rounded-full flex items-center justify-center`}>
            <div className={corTexto}>{icone}</div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
          </div>
        </div>

        {/* Mensagem */}
        <p className="text-gray-700 mb-8 leading-relaxed">{mensagem}</p>

        {/* Botões */}
        <div className={`flex gap-4 ${mostrarBotaoSecundario ? 'justify-between' : 'justify-end'}`}>
          {mostrarBotaoSecundario && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {textoBotaoSecundario}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${mostrarBotaoSecundario ? 'flex-1' : ''} px-4 py-2 ${corBotaoPrimario} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processando...' : textoBotaoPrimario}
          </button>
        </div>
      </div>
    </div>
  );
}
