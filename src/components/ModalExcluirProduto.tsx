"use client";

type Produto = { id: number; nome: string; };
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  produto: Produto | null;
};

export default function ModalExcluirProduto({ isOpen, onClose, onConfirm, produto }: ModalProps) {
  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <h2 className="text-2xl font-bold mt-4 text-brand-dark">Confirmar Exclusão</h2>
        <p className="text-gray-600 mt-2">
          Tem certeza que deseja excluir o produto <span className="font-bold">{produto.nome}</span>? Esta ação não pode ser desfeita.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onClose} className="px-8 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-8 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}