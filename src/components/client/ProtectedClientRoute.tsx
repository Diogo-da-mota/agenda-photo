import React from 'react';
import { Navigate } from 'react-router-dom';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedClientRouteProps {
  children: React.ReactNode;
}

const ProtectedClientRoute: React.FC<ProtectedClientRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, cliente } = useClienteAuth();
  
  console.log('[DEBUG ProtectedClientRoute] Estado atual:', {
    isLoading,
    isAuthenticated,
    hasCliente: !!cliente,
    clienteNome: cliente?.nome_completo,
    clienteTitulo: cliente?.titulo
  });

  // ✅ CORREÇÃO: Aguardar carregamento completo
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // ✅ CORREÇÃO: Validação dupla - autenticação E dados válidos
  const hasValidAuth = isAuthenticated && cliente && cliente.nome_completo;

  if (!hasValidAuth) {
    return <Navigate to="/agenda/cliente-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedClientRoute;