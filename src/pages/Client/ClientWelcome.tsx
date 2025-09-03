import React from 'react';
import { User } from 'lucide-react';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';

const ClientWelcome = () => {
  const { cliente } = useClienteAuth();

  // Debug logs para verificar dados do cliente
  console.log('👋 [DEBUG ClientWelcome] Componente renderizado');
  console.log('👋 [DEBUG ClientWelcome] Objeto cliente:', cliente);
  console.log('👋 [DEBUG ClientWelcome] Campo titulo:', cliente?.titulo);

  return (
    <div className="min-h-screen p-4" style={{backgroundColor: '#0f1729'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header - Card de Boas-vindas */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {(() => {
                  const nomeExibido = cliente?.titulo;
                  console.log('👋 [DEBUG ClientWelcome] Nome a ser exibido:', nomeExibido);
                  return nomeExibido;
                })()}
              </h1>
              <p className="text-gray-600">
                Bem-vindo ao seu portal de agendamentos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWelcome;