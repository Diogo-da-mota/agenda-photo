import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { SecureLogger } from '@/utils/SecureLogger';
import { useAuthState } from './auth/useAuthState';
import { useAuthNavigation } from './auth/useAuthNavigation';
import { useAuthActions } from './auth/useAuthActions';

// Interfaces para tipagem
interface UserMetadata {
  nome?: string;
  telefone?: string;
  empresa?: string;
  [key: string]: unknown;
}

interface UserUpdateData {
  email?: string;
  password?: string;
  data?: UserMetadata;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (context?: 'login' | 'register') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: UserUpdateData) => Promise<{ success: boolean; error?: string }>;
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Componente AuthProvider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthState();
  const { navigate, currentLocation, navigationAvailable } = useAuthNavigation();
  const authActions = useAuthActions();

  useEffect(() => {
    if (authState.initializingRef.current || authState.initializedRef.current) {
      return;
    }

    authState.initializingRef.current = true;
    let isMounted = true;
    let sessionCheckInterval: NodeJS.Timeout;

    // Função para verificar e renovar sessão se necessário
    const checkAndRefreshSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          SecureLogger.warn('[AUTH] Erro ao verificar sessão:', error);
          return;
        }

        if (session && session.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          const fiveMinutes = 5 * 60 * 1000;

          // Se a sessão expira em menos de 5 minutos, renovar
          if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
            SecureLogger.info('[AUTH] Renovando sessão próxima do vencimento.');
            const { error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              SecureLogger.error('[AUTH] Erro ao renovar sessão:', refreshError);
              // Se não conseguir renovar, fazer logout
              await supabase.auth.signOut();
            } else {
              SecureLogger.info('[AUTH] Sessão renovada com sucesso.');
            }
          }
        }
      } catch (error) {
        SecureLogger.error('[AUTH] Erro crítico na verificação de sessão:', error);
      }
    };

    // Configurar listener PRIMEIRO
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          authState.setSession(session);
          authState.setUser(session?.user || null);
          
          if (authState.initialSessionChecked) {
            authState.setLoading(false);
          }

          SecureLogger.debug(`[AUTH] Evento: ${event}`);
          
          if (event === 'SIGNED_IN' && session?.user) {
            SecureLogger.info('[AUTH] Usuário logado.', { userId: session.user.id });
            // Iniciar verificação periódica da sessão
            sessionCheckInterval = setInterval(checkAndRefreshSession, 60000); // A cada minuto
          } else if (event === 'SIGNED_OUT') {
            SecureLogger.info('[AUTH] Usuário deslogado.');
            // Parar verificação da sessão
            if (sessionCheckInterval) {
              clearInterval(sessionCheckInterval);
            }
            try {
              localStorage.removeItem('redirectAfterAuth');
            } catch (e) {
              SecureLogger.warn('[AUTH] Erro ao limpar localStorage:', e);
            }
          }
        }
      }
    );

    // DEPOIS obter sessão inicial
    const initSession = () => {
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          SecureLogger.error('[AUTH] Erro ao obter sessão:', error);
        }

        if (isMounted) {
          const currentSession = data.session;
          const currentUser = currentSession?.user || null;
          
          authState.setSession(currentSession);
          authState.setUser(currentUser);
          authState.setInitialSessionChecked(true);
          authState.initializedRef.current = true;
          authState.setLoading(false);
          authState.initializingRef.current = false;

          if (currentUser) {
            SecureLogger.info('[AUTH] Sessão inicial obtida: Usuário autenticado.', { userId: currentUser.id });
            
            // Iniciar verificação periódica da sessão para usuários já logados
            sessionCheckInterval = setInterval(checkAndRefreshSession, 60000);
            // Verificar imediatamente se a sessão precisa ser renovada
            checkAndRefreshSession();
            
            if (navigationAvailable && navigate && currentLocation === '/login') {
              try {
                const redirectTo = localStorage.getItem('redirectAfterAuth');
                if (redirectTo) {
                  localStorage.removeItem('redirectAfterAuth');
                  SecureLogger.debug(`[AUTH] Redirecionando para: ${redirectTo}`);
                  navigate(redirectTo);
                }
              } catch (storageError: unknown) {
              SecureLogger.warn('[AUTH] localStorage não disponível para redirecionamento', storageError);
            }
            }
          } else {
            SecureLogger.debug('[AUTH] Sessão inicial obtida: Não autenticado');
          }
        }
      }).catch((error: unknown) => {
        SecureLogger.error('[AUTH] Erro crítico ao obter sessão inicial:', error);
        if (isMounted) {
          authState.setInitialSessionChecked(true);
          authState.initializedRef.current = true;
          authState.setLoading(false);
          authState.initializingRef.current = false;
        }
      });
    };

    initSession();

    return () => {
      isMounted = false;
      authState.initializingRef.current = false;
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      authListener.subscription.unsubscribe();
    };
  }, [navigationAvailable]);

  const value: AuthContextType = {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn: authActions.signIn,
    signUp: authActions.signUp,
    signInWithGoogle: authActions.signInWithGoogle,
    signOut: authActions.signOut,
    resetPassword: authActions.resetPassword,
    updateUser: authActions.updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
