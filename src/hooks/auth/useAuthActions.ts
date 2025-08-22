import { supabase } from '@/lib/supabase';
import { SecureLogger } from '@/utils/SecureLogger';

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

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        SecureLogger.warn('[AUTH] Erro no login:', error);
        return { success: false, error: error.message };
      }

      SecureLogger.info('[AUTH] Login realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      SecureLogger.error('[AUTH] Erro crítico no login:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });

      if (error) {
        SecureLogger.warn('[AUTH] Erro no registro:', error);
        return { success: false, error: error.message };
      }

      SecureLogger.info('[AUTH] Registro realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      SecureLogger.error('[AUTH] Erro crítico no registro:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const signInWithGoogle = async (context?: 'login' | 'register') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        SecureLogger.warn('[AUTH] Erro no login com Google:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      SecureLogger.error('[AUTH] Erro crítico no login com Google:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        SecureLogger.warn('[AUTH] Erro no logout:', error);
        throw error;
      }

      SecureLogger.info('[AUTH] Logout realizado com sucesso');
    } catch (error: any) {
      SecureLogger.error('[AUTH] Erro crítico no logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        SecureLogger.warn('[AUTH] Erro no reset de senha:', error);
        return { success: false, error: error.message };
      }

      SecureLogger.info('[AUTH] Reset de senha enviado');
      return { success: true };
    } catch (error: any) {
      SecureLogger.error('[AUTH] Erro crítico no reset de senha:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const updateUser = async (data: UserUpdateData) => {
    try {
      const { error } = await supabase.auth.updateUser(data);

      if (error) {
        SecureLogger.warn('[AUTH] Erro na atualização do usuário:', error);
        return { success: false, error: error.message };
      }

      SecureLogger.info('[AUTH] Usuário atualizado com sucesso');
      return { success: true };
    } catch (error: any) {
      SecureLogger.error('[AUTH] Erro crítico na atualização do usuário:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUser,
  };
};