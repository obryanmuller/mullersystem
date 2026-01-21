// src/components/ModalAlterarSenha.tsx
"use client";

import { useState } from 'react';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';

interface ModalAlterarSenhaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModalAlterarSenha({
  isOpen,
  onClose,
  onSuccess,
}: ModalAlterarSenhaProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!senhaAtual || !senhaNova || !confirmarSenha) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (senhaNova.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (senhaNova !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (senhaAtual === senhaNova) {
      setError('A nova senha não pode ser igual à senha atual');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senhaAtual,
          senhaNova,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao alterar senha');
        return;
      }

      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => {
        setSenhaAtual('');
        setSenhaNova('');
        setConfirmarSenha('');
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Erro ao alterar senha:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Alterar Senha</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Senha Atual */}
          <div>
            <label
              htmlFor="senhaAtual"
              className="block text-sm font-medium text-gray-700"
            >
              Senha Atual
            </label>
            <div className="relative mt-1">
              <input
                id="senhaAtual"
                type={showPasswords.current ? 'text' : 'password'}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Senha Nova */}
          <div>
            <label
              htmlFor="senhaNova"
              className="block text-sm font-medium text-gray-700"
            >
              Nova Senha
            </label>
            <div className="relative mt-1">
              <input
                id="senhaNova"
                type={showPasswords.new ? 'text' : 'password'}
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label
              htmlFor="confirmarSenha"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar Nova Senha
            </label>
            <div className="relative mt-1">
              <input
                id="confirmarSenha"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
