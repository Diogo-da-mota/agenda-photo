import React, { useState } from 'react';
import { Cliente } from '@/types/clients';

// Definindo props para SimpleClientForm
export interface SimpleClientFormProps {
  onSuccess: (cliente: Cliente) => void;
  onCancel: () => void;
}

const SimpleClientForm: React.FC<SimpleClientFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newClient: Cliente = {
      id: 'temp_' + Date.now(), // ID temporário
      criado_em: new Date().toISOString(),
      nome: nome,
      telefone: telefone,
      user_id: 'temp_user'
    };

    onSuccess(newClient);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome:
        </label>
        <input
          type="text"
          id="nome"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
          Telefone:
        </label>
        <input
          type="text"
          id="telefone"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email:
        </label>
        <input
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
          Empresa:
        </label>
        <input
          type="text"
          id="empresa"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="bg-gray-200 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-indigo-600 px-4 py-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default SimpleClientForm;
