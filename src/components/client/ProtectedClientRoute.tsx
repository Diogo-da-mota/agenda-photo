import React from 'react';
import { Navigate } from 'react-router-dom';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedClientRouteProps {
  children: React.ReactNode;
}

const ProtectedClientRoute: React.FC<ProtectedClientRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, cliente } = useClienteAuth();

  // Mostrar loading enquanto verifica autenticação ou se autenticado mas sem dados do cliente
  if (isLoading || (isAuthenticated && !cliente)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/agenda/cliente-login" replace />;
  }

  // Renderizar conteúdo protegido se autenticado
  return <>{children}</>;
};

export default ProtectedClientRoute;