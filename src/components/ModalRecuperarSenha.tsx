// src/components/ModalRecuperarSenha.tsx
"use client";

import { FiX, FiMail, FiSmile } from "react-icons/fi";

interface ModalRecuperarSenhaProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalRecuperarSenha({
  isOpen,
  onClose,
}: ModalRecuperarSenhaProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-green/15 rounded-full flex items-center justify-center">
              <FiSmile className="w-6 h-6 text-brand-green" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Esqueceu a senha?
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="mb-8">
          <p className="text-gray-700 mb-4">
            Não entre em pânico 😊,  
            estou aqui para te ajudar a recuperar o acesso à sua conta.
          </p>

          <div className="bg-brand-green/10 p-4 rounded-lg border border-brand-green/30">
            <div className="flex items-start gap-3">
              <FiMail className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-brand-green mb-1">
                  Entre em contato com o Bryan
                </p>
                <p className="text-sm text-gray-700">
                  Envie uma mensagem para o Bryan e em breve
                  ajudaremos você a redefinir sua senha.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="flex">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-brand-green text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
