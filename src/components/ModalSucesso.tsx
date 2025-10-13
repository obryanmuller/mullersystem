"use client";

// Define as propriedades que nosso modal pode receber
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
};

export default function ModalSucesso({ isOpen, onClose, title, message }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm text-center">
        {/* Ícone de Sucesso */}
        <svg className="mx-auto h-16 w-16 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        {/* Título e Mensagem Dinâmicos */}
        <h2 className="text-2xl font-bold mt-4 text-brand-dark">{title}</h2>
        <p className="text-gray-600 mt-2">{message}</p>
        
        {/* Botão para fechar */}
        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full px-8 py-3 bg-brand-green text-white font-bold rounded-lg hover:opacity-90"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}