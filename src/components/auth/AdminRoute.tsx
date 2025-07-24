import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SecureLogger } from '@/utils/SecureLogger';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallback = '/dashboard' 
}) => {
  const { user, session, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const { toast } = useToast();

  // Mostrar loading enquanto verifica autenticação e role
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificar se está autenticado
  if (!user || !session) {
    SecureLogger.warn('[AUTH] Acesso não autorizado à rota de admin.', {
      path: location.pathname,
      reason: 'Usuário não autenticado',
    });
    return <Navigate to="/" replace />;
  }

  // Verificar se é admin
  if (!isAdmin) {
    SecureLogger.error(
      '[AUTH] Tentativa de acesso não autorizado à rota de admin.',
      new Error('User is not an admin'),
      {
        path: location.pathname,
        reason: 'Permissões insuficientes',
        userId: user.id,
      }
    );
    
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão para acessar esta área.",
      variant: "destructive",
    });
    
    return <Navigate to={fallback} replace />;
  }

  // Log de acesso autorizado para auditoria
  SecureLogger.info('[AUTH] Acesso autorizado à rota de admin.', {
    path: location.pathname,
    userId: user.id,
    role: 'admin',
  });

  // Usuário é admin - renderizar componente protegido
  return <>{children}</>;
};

export default AdminRoute; 