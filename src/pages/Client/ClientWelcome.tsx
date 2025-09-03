import React, { useEffect } from 'react';
import { User } from 'lucide-react';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';

const ClientWelcome = () => {
  const { cliente } = useClienteAuth();

  // DEBUG: Log do estado do cliente no ClientWelcome
  useEffect(() => {
    console.log('🔍 [ClientWelcome] DEBUG - Estado do cliente:', {
      cliente: cliente,
      titulo: cliente?.titulo,
      nome_completo: cliente?.nome_completo,
      hasCliente: !!cliente,
      clienteKeys: cliente ? Object.keys(cliente) : [],
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
  }, [cliente]);



  return (
    <div className="min-h-screen p-4" style={{backgroundColor: '#0f1729'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header - Card de Boas-vindas */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {cliente?.titulo}
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