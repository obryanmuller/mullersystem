"use client";
import { useState, useEffect } from 'react';

type Cliente = { 
    id: number; 
    nome: string; 
    email: string; 
    telefone: string | null; 
    status: string; 
    cpf: string; 
    enderecoRua: string;
    enderecoBairro: string;
    enderecoCidade: string;
    enderecoEstado: string;
    enderecoRef: string | null;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onClientUpdated: () => void;
};

export default function ModalEditarCliente({ isOpen, onClose, cliente, onClientUpdated }: ModalProps) {
    const [formData, setFormData] = useState({ 
        nome: '', email: '', telefone: '', status: 'Ativo', cpf: '',
        rua: '', bairro: '', cidade: '', estado: '', referencia: '',
    });

    useEffect(() => {
        const fetchClientData = async (clientId: number) => {
            try {
                const response = await fetch(`/api/clientes/${clientId}`);
                const data = await response.json();
                if (response.ok) {
                     setFormData({
                        nome: data.nome,
                        email: data.email,
                        telefone: data.telefone || '',
                        status: data.status,
                        cpf: data.cpf,
                        rua: data.enderecoRua,
                        bairro: data.enderecoBairro,
                        cidade: data.enderecoCidade,
                        estado: data.enderecoEstado,
                        referencia: data.enderecoRef || '',
                    });
                } else {
                    throw new Error(data.error || 'Não foi possível buscar os dados do cliente');
                }
            } catch (error) {
                console.error(error);
                alert('Erro ao carregar dados do cliente para edição.');
                onClose();
            }
        };

        if (isOpen && cliente) {
            fetchClientData(cliente.id);
        }
    }, [isOpen, cliente, onClose]);

    if (!isOpen || !cliente) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const clienteEditado = {
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            status: formData.status,
            cpf: formData.cpf,
            endereco: {
                rua: formData.rua,
                bairro: formData.bairro,
                cidade: formData.cidade,
                estado: formData.estado,
                referencia: formData.referencia,
            }
        };

        try {
            const response = await fetch(`/api/clientes/${cliente.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteEditado)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Falha ao atualizar cliente');
            }

            onClientUpdated();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao atualizar cliente: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl my-8">
                <h2 className="text-2xl font-bold mb-6 text-brand-dark">Editar Cliente: {formData.nome}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* O JSX do seu formulário continua o mesmo */}
                    <div><label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome Completo</label><input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label><input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div><div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div><div><label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label><input type="text" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div></div>
                    <h3 className="text-lg font-semibold border-t pt-6 text-gray-800">Endereço de Cobrança / Entrega</h3>
                    <div><label htmlFor="rua" className="block text-sm font-medium text-gray-700">Rua e Número</label><input type="text" id="rua" name="rua" value={formData.rua} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="md:col-span-2"><label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro</label><input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div><div><label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label><input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div><div><label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label><input type="text" id="estado" name="estado" value={formData.estado} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div></div>
                    <div><label htmlFor="referencia" className="block text-sm font-medium text-gray-700">Ponto de Referência (Opcional)</label><input type="text" id="referencia" name="referencia" value={formData.referencia} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green" /></div>
                    <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label><select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"><option>Ativo</option><option>Inativo</option></select></div>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button><button type="submit" className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90">Salvar Alterações</button></div>
                </form>
            </div>
        </div>
    );
}