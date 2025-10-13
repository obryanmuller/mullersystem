"use client";

type Cliente = { id: number; nome: string; }; 
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onClientDeleted: () => void;
};

export default function ModalExcluirCliente({ isOpen, onClose, cliente, onClientDeleted }: ModalProps) {
  if (!isOpen || !cliente) return null;

  const handleConfirm = async () => {
    try {
        const response = await fetch(`/api/clientes/${cliente.id}`, {
            method: 'DELETE',
        });

        if (response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Falha ao excluir cliente');
        }

        onClientDeleted();
        onClose();
    } catch (error: any) {
        console.error(error);
        alert(`Erro ao excluir cliente: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Confirmação de Exclusão
        </h2>
        <p className="mb-6 text-gray-700">Tem certeza que deseja **excluir permanentemente** o cliente:</p>
        <p className="mb-8 p-3 bg-red-50 text-red-800 font-semibold rounded-md">{cliente.nome} (ID: {cliente.id})</p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}