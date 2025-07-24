import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { SecureLogger } from '@/utils/SecureLogger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = '/' 
}) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Se não estiver autenticado e não estiver carregando, salvar a rota atual
    if (!loading && !user && !session) {
      // Tentar salvar a rota que o usuário tentou acessar para redirecionamento após login
      // Não depender exclusivamente do localStorage
      try {
        localStorage.setItem('redirectAfterAuth', location.pathname);
      } catch (storageError: any) {
        SecureLogger.warn('[PROTECTED_ROUTE] localStorage não disponível para salvar redirecionamento', { error: storageError.message });
      }
      
      // toast({
      //   title: "Acesso Restrito",
      //   description: "Você precisa estar logado para acessar esta página.",
      //   variant: "destructive",
      // });
    }
  }, [user, session, loading, location.pathname]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificar se há sessão válida
  if (!user || !session) {
    SecureLogger.warn('[AUTH] Acesso não autorizado à rota protegida.', {
      path: location.pathname,
      reason: 'Usuário não autenticado',
    });
    
    // Redirecionar apenas para o fallback, sem parâmetro redirectTo
    return <Navigate to={fallback} replace />;
  }

  // Verificar se a sessão não expirou (opcional - timeout de segurança)
  if (session.expires_at) {
    const sessionExpired = session.expires_at * 1000 < Date.now();
    if (sessionExpired) {
      SecureLogger.warn('[AUTH] Tentativa de acesso com sessão expirada.', {
        path: location.pathname,
        userId: user.id,
      });
      // toast({
      //   title: "Sessão Expirada",
      //   description: "Sua sessão expirou. Faça login novamente.",
      //   variant: "destructive",
      // });
      
      const redirectUrl = `${fallback}?redirectTo=${encodeURIComponent(location.pathname)}`;
      return <Navigate to={redirectUrl} replace />;
    }
  }

  // Log de acesso autorizado para auditoria
  SecureLogger.info('[AUTH] Acesso autorizado à rota protegida.', {
    path: location.pathname,
    userId: user.id,
    role: 'protected',
  });

  // Usuário autenticado - renderizar componente protegido
  return <>{children}</>;
};

export default ProtectedRoute; 