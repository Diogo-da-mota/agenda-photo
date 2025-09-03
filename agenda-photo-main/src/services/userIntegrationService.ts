import { supabase } from '@/lib/supabase';
import { sanitizeTableName } from '@/utils/validation';

// Definindo interfaces para perfil e integração do usuário
export interface Profile {
  id: string;
  updated_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  billing_address?: string;
  payment_method?: string;
  billing_city?: string;
  billing_country?: string;
  email?: string;
  phone?: string;
  user_id?: string;
  created_at?: string;
  nome?: string;
  role?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface SimpleProfile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  criado_em?: string;
  role?: string;
  atualizado_em?: string;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  webhook_enabled: boolean;
  custom_domain?: string;
  company_logo?: string;
  logo_url?: string;
  webhook_url?: string;
}

// Função para obter o perfil do usuário
export const getUserProfile = async (): Promise<Profile | null> => {
  try {
    // Obter dados do usuário autenticado
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user || !sessionData.session?.user) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('[USER] Não foi possível obter perfil: Usuário não autenticado', userError);
      }
      return null;
    }
    
    const userId = userData.user.id;
    
    // Tentar buscar o perfil da tabela de perfis
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      // Se não houver perfil na tabela 'perfis', retornar um perfil padrão com dados da sessão
      if (error) {
        // Log apenas em desenvolvimento
        if (import.meta.env.MODE === 'development') {
          console.log('Perfil não encontrado na tabela perfis, usando dados da autenticação');
        }
        return {
          id: userData.user.id,
          updated_at: new Date().toISOString(),
          username: userData.user.email?.split('@')[0],
          full_name: userData.user.user_metadata?.full_name,
          avatar_url: userData.user.user_metadata?.avatar_url,
          email: userData.user.email,
          phone: userData.user.phone,
          user_id: userData.user.id,
          created_at: userData.user.created_at,
          nome: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'Usuário',
          role: 'usuario'
        };
      }
      return data;
    }
    
    // Combinar dados do auth com dados do perfil
    // Usar try/catch para acessar propriedades potencialmente não existentes
    const updatedAt = new Date().toISOString();
    
    return {
      ...data,
      id: userId,
      updated_at: updatedAt,
      username: data.nome || userData.user.email?.split('@')[0],
      full_name: data.nome,
      avatar_url: data.avatar_url,
      email: userData.user.email,
      user_id: userId,
      created_at: data.criado_em
    };
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao buscar perfil:', error);
    }
    return null;
  }
};

// Função para atualizar o perfil do usuário
export const updateUserProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user || !sessionData.session?.user) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('[USER] Não foi possível atualizar perfil: Usuário não autenticado', userError);
      }
      return null;
    }
    
    const userId = userData.user.id;
    const userEmail = userData.user.email || 'email@exemplo.com';
    
    // Criar dados de perfil combinados
    const updatedProfileData = {
      id: userId,
      nome: profileData.nome || profileData.full_name || 'Nome do Usuário',
      email: userEmail,
      avatar_url: profileData.avatar_url,
      criado_em: profileData.created_at || new Date().toISOString(),
      role: profileData.role || 'usuario'
    };

    // Salvar na tabela de perfis
    const { data, error } = await supabase
      .from('perfis')
      .upsert(updatedProfileData)
      .select()
      .single();
    
    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao atualizar perfil na tabela:', error);
        console.log('Dados de perfil atualizados apenas em memória:', profileData);
      }
      
      return {
        id: userId,
        updated_at: new Date().toISOString(),
        user_id: userId,
        created_at: userData.user.created_at,
        ...profileData
      };
    }
    
    // Combinar dados atualizados
    return {
      ...data,
      id: userId,
      updated_at: new Date().toISOString(),
      username: data.nome,
      full_name: data.nome,
      user_id: userId,
      created_at: data.criado_em,
      ...profileData
    };
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao atualizar perfil:', error);
    }
    return null;
  }
};

// Função para obter as integrações do usuário
export const getUserIntegrations = async (): Promise<UserIntegration[] | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user || !sessionData.session?.user) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('[USER] Não foi possível obter integrações: Usuário não autenticado', userError);
      }
      return null;
    }
    
    const userId = userData.user.id;
    
    // Tentar buscar da tabela de configurações de integrações
    const { data, error } = await supabase
      .from('configuracoes_integracoes')
      .select('*')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      // Fornecer dados padrão quando não há integração configurada
      const defaultIntegration = {
        id: `default-${userId}`,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        webhook_enabled: false,
        custom_domain: undefined,
        company_logo: undefined,
        webhook_url: undefined,
        logo_url: undefined
      };

      return [defaultIntegration];
    }

    return data as UserIntegration[];
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao buscar integrações do usuário:', error);
    }
    return null;
  }
};

// Função para atualizar as integrações do usuário
export const updateUserIntegrations = async (updates: Partial<UserIntegration>): Promise<UserIntegration | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user || !sessionData.session?.user) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('[USER] Não foi possível atualizar integrações: Usuário não autenticado', userError);
      }
      return null;
    }
    
    const userId = userData.user.id;
    
    // Garantir que o user_id esteja definido
    const updatesWithUserId = {
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    // Tentar salvar na tabela de configurações de integrações
    const { data, error } = await supabase
      .from('configuracoes_integracoes')
      .upsert(updatesWithUserId)
      .select()
      .single();

    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao atualizar integrações do usuário:', error);
        // Log removido por segurança - não expor dados de integração com userId
      }
      
      // Fornecer dados salvos em memória
      return {
        id: `updated-${userId}`,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        webhook_enabled: false,
        ...updates
      };
    }

    return data as UserIntegration;
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao atualizar integrações do usuário:', error);
    }
    return null;
  }
};

// Alias para compatibilidade com código existente
export const saveUserIntegration = updateUserIntegrations;
