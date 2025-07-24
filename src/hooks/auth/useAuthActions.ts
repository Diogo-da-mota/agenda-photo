import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { SecureLogger } from '@/utils/SecureLogger';

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

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    try {
      SecureLogger.info('[AUTH] Tentativa de login.', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        SecureLogger.warn('[AUTH] Erro no login:', error, { email });
        let errorMessage = 'Erro no login. Verifique suas credenciais.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'E-mail não confirmado. Verifique sua caixa de entrada.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        SecureLogger.info('[AUTH] Login bem-sucedido.', { userId: data.user.id });

        return { success: true };
      }

      return { success: false, error: 'Falha na autenticação' };
    } catch (error: unknown) {
      SecureLogger.error('[AUTH] Exceção no login:', error, { email });
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    try {
      SecureLogger.info('[AUTH] Tentativa de criar conta.', { email, metadata });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        SecureLogger.warn('[AUTH] Erro na criação de conta:', error, { email });
        
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este e-mail já está cadastrado. Tente fazer login.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (data.user && !data.session) {
        toast({
          title: "Confirmação necessária",
          description: "Verifique seu e-mail para confirmar sua conta.",
        });
      } else if (data.user && data.session) {
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo à plataforma!",
        });
        SecureLogger.info('[AUTH] Nova conta criada e sessão iniciada.', { userId: data.user.id });
      }

      return { success: true, data };
    } catch (error: unknown) {
      SecureLogger.error('[AUTH] Exceção na criação de conta:', error, { email });
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const signInWithGoogle = async (context: 'login' | 'register' = 'login') => {
    try {
      SecureLogger.info(`[AUTH] Tentativa de login com Google (contexto: ${context}).`);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        SecureLogger.error('[AUTH] Erro no login com Google:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      SecureLogger.error('[AUTH] Exceção no login com Google:', error);
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      SecureLogger.info('[AUTH] Tentativa de logout.');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        SecureLogger.error('[AUTH] Erro no logout:', error);
      }
    } catch (error: unknown) {
      SecureLogger.error('[AUTH] Exceção no logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      SecureLogger.info('[AUTH] Tentativa de reset de senha.', { email });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        SecureLogger.error('[AUTH] Erro no reset de senha:', error, { email });
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      SecureLogger.error('[AUTH] Exceção no reset de senha:', error, { email });
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const updateUser = async (data: UserUpdateData, userId?: string) => {
    try {
      SecureLogger.info('[AUTH] Tentativa de atualizar usuário.', { userId });
      const { error } = await supabase.auth.updateUser(data);

      if (error) {
        SecureLogger.error('[AUTH] Erro ao atualizar usuário:', error, { userId });
        return { success: false, error: error.message };
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas.",
      });

      return { success: true };
    } catch (error: unknown) {
      SecureLogger.error('[AUTH] Exceção ao atualizar usuário:', error, { userId });
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUser
  };
};