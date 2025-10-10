"use client";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ModalAdicionarCliente({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const clienteData = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      status: data.status,
      cpf: data.cpf,
      endereco: {
        rua: data.rua,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        referencia: data.referencia || '',
      },
    };

    console.log("Novo cliente com Endereço e CPF:", clienteData);
    alert("Cliente salvo no console!");
    onClose();
  };

  return (
    <div
      className="
        fixed inset-0 bg-black bg-opacity-60 
        flex items-center justify-center 
        z-[60] 
        overflow-y-auto
      "
    >
      <div
        className="
          bg-white p-8 rounded-lg shadow-2xl 
          w-full max-w-2xl 
          my-10 relative
        "
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Cadastrar Novo Cliente
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
              />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
              />
            </div>
          </div>

          {/* Endereço */}
          <h3 className="text-lg font-semibold border-t pt-6 text-gray-800">
            Endereço de Cobrança / Entrega
          </h3>

          <div>
            <label htmlFor="rua" className="block text-sm font-medium text-gray-700">
              Rua e Número
            </label>
            <input
              type="text"
              id="rua"
              name="rua"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                Bairro
              </label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
              />
            </div>
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
              />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
              />
            </div>
          </div>

          <div>
            <label htmlFor="referencia" className="block text-sm font-medium text-gray-700">
              Ponto de Referência (Opcional)
            </label>
            <input
              type="text"
              id="referencia"
              name="referencia"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="Ativo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
            >
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:opacity-90"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
