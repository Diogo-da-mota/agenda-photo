import { supabase } from '@/lib/supabase';
import { SecureLogger } from '@/utils/SecureLogger';

/**
 * Verifica se já existe um usuário cadastrado com o email informado de forma segura
 * @param email - Email a ser verificado
 * @returns Promise<boolean> - true se o usuário existe, false caso contrário
 */
export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return false;
    }
    
    // Normaliza o email antes de verificar
    const normalizedEmail = normalizeEmail(email);
    
    // Usar recuperação de senha como método seguro para verificar existência
    // Isso não causa problemas de tentativas de login com senha inválida
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    // Se não houver erro, o email existe
    // Se houver erro dizendo que o usuário não foi encontrado, o email não existe
    if (error) {
      if (error.message.includes('User not found') || 
          error.message.includes('user not found') ||
          error.message.includes('Invalid user')) {
        return false;
      }
      
      // Para outros tipos de erro, assumimos que o email pode existir,
      // mas ocorreu um problema de comunicação
      SecureLogger.warn('[AUTH_UTILS] Erro ao verificar existência do usuário.', { error: error.message });
      return false;
    }
    
    // Se não houve erro, o email existe
    return true;
    
  } catch (error) {
    SecureLogger.error('[AUTH_UTILS] Exceção ao verificar existência do usuário.', { error: error instanceof Error ? error.message : 'Unknown error' });
    // Em caso de erro de conexão, não bloquear o processo
    return false;
  }
};

/**
 * Valida formato do email
 * @param email - Email a ser validado
 * @returns boolean - true se o email é válido
 */
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
};

/**
 * Normaliza o email (converte para lowercase e remove espaços)
 * @param email - Email a ser normalizado
 * @returns string - Email normalizado
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};