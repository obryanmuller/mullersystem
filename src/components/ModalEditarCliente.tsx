"use client";
import { useState, useEffect } from 'react';

// Tipos
type Cliente = { id: number; nome: string; email: string; telefone: string; status: string; };
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
};

export default function ModalEditarCliente({ isOpen, onClose, cliente }: ModalProps) {
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', status: 'Ativo' });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        status: cliente.status,
      });
    }
  }, [cliente]);

  if (!isOpen || !cliente) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Salvando alterações do cliente:", { id: cliente.id, ...formData });
    alert('Alterações do cliente salvas no console!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Editar Cliente: {cliente.nome}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
            <div><label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label><input type="text" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
          </div>
          <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green">
                  <option>Ativo</option>
                  <option>Inativo</option>
              </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
}