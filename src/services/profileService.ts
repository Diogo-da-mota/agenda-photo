
import { supabase } from '@/lib/supabase';

// Interface para o perfil do usuário - usando tabela 'perfis' que existe no banco
export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role?: string;
  avatar_url?: string;
  criado_em?: string;
}

/**
 * Obtém o perfil do usuário atual
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    // Buscar perfil na tabela 'perfis'
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao obter perfil:', error.message);
      return null;
    }
    
    // Se não encontrou perfil, retornar null
    if (!data) return null;
    
    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    return null;
  }
};

/**
 * Atualiza o perfil do usuário
 */
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    // Atualizar perfil existente na tabela 'perfis'
    const { data, error } = await supabase
      .from('perfis')
      .update(profile)
      .eq('id', user.id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao atualizar perfil:', error.message);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return null;
  }
};

/**
 * Cria um novo perfil de usuário
 */
export const createUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    // Criar novo perfil na tabela 'perfis'
    const newProfile = {
      id: user.id,  // ID deve ser sempre preenchido com o ID do usuário autenticado
      criado_em: new Date().toISOString(),
      // Garantir que campos obrigatórios estão preenchidos
      nome: profile.nome || '',
      email: profile.email || user.email || ''
    };
    
    const { data, error } = await supabase
      .from('perfis')
      .insert(newProfile) // Removido o array wrapper - objeto único
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar perfil:', error.message);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};
