"use client";

import { useState } from 'react';
import ModalSucesso from '@/components/ModalSucesso';

export default function UsuariosPage() {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'COMMON' });
    const [isLoading, setIsLoading] = useState(false);
    const [successModalInfo, setSuccessModalInfo] = useState({
        isOpen: false,
        title: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao cadastrar usuário');
            }

            setSuccessModalInfo({ 
                isOpen: true, 
                title: 'Usuário Adicionado!', 
                message: `O novo usuário ${formData.email} foi cadastrado com sucesso e tem a função de ${formData.role}.` 
            });
            setFormData({ email: '', password: '', role: 'COMMON' }); // Resetar formulário
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
            alert(`Erro: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="w-full max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-brand-dark mb-6">Gerenciamento de Usuários</h1>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Criar Novo Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Login (Email ou Nome de Usuário)
                            </label>
                            <input
                                type="text" // <-- CORRIGIDO AQUI
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Senha Temporária
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Função
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
                            >
                                <option value="COMMON">Comum</option>
                                <option value="MASTER">Mestre (Admin)</option>
                            </select>
                        </div>
                        
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                            >
                                {isLoading ? 'Salvando...' : 'Criar Usuário'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ModalSucesso
                isOpen={successModalInfo.isOpen}
                onClose={() => setSuccessModalInfo({ isOpen: false, title: '', message: '' })}
                title={successModalInfo.title}
                message={successModalInfo.message}
            />
        </>
    );
}