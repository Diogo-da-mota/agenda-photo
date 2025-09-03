import { supabase } from '@/lib/supabase';

export interface ConfiguracaoEmpresa {
  id: string;
  user_id: string;
  nome_empresa?: string;
  cnpj?: string;
  telefone?: string;
  whatsapp?: string;
  email_empresa?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  instagram?: string;
  facebook?: string;
  site?: string;
  logo_url?: string;
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Busca as configurações da empresa para o usuário especificado
 * @param userId ID do usuário (opcional, se não fornecido usa o usuário logado)
 * @returns Configurações da empresa ou null se não encontradas
 */
export const buscarConfiguracaoEmpresa = async (userId?: string): Promise<ConfiguracaoEmpresa | null> => {
  try {
    let userIdToUse = userId;
    
    // Se não foi fornecido userId, buscar o usuário logado
    if (!userIdToUse) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Usuário não autenticado');
        return null;
      }
      userIdToUse = user.id;
    }
    
    const { data, error } = await supabase
      .from('configuracoes_empresa')
      .select('*')
      .eq('user_id', userIdToUse)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.warn('Nenhuma configuração encontrada para o usuário:', userIdToUse);
        return null;
      }
      console.error('Erro ao buscar configurações da empresa:', error.message);
      return null;
    }
    
    return data as ConfiguracaoEmpresa;
  } catch (error) {
    console.error('Erro ao carregar configurações da empresa:', error);
    return null;
  }
};

/**
 * Busca configurações de empresa para qualquer usuário (função pública para galeria)
 * @param userId ID do usuário
 * @returns Configurações da empresa ou null se não encontradas
 */
export const buscarConfiguracaoEmpresaPublica = async (userId: string): Promise<ConfiguracaoEmpresa | null> => {
  try {
    const { data, error } = await supabase
      .from('configuracoes_empresa')
      .select('nome_empresa, telefone, email_empresa, whatsapp, instagram, facebook, site, logo_url')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('Nenhuma configuração encontrada para o usuário:', userId);
        return null;
      }
      console.error('Erro ao buscar configurações da empresa:', error.message);
      return null;
    }
    
    return data as ConfiguracaoEmpresa;
  } catch (error) {
    console.error('Erro ao carregar configurações da empresa:', error);
    return null;
  }
};

/**
 * Salva ou atualiza as configurações da empresa
 * @param configuracoes Configurações a serem salvas
 * @returns true se salvou com sucesso, false caso contrário
 */
export const salvarConfiguracaoEmpresa = async (configuracoes: Partial<ConfiguracaoEmpresa>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return false;
    }
    
    // Verificar se já existe configuração para o usuário
    const { data: existingConfig, error: fetchError } = await supabase
      .from('configuracoes_empresa')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao verificar configurações existentes:', fetchError.message);
      return false;
    }
    
    const configData = {
      ...configuracoes,
      user_id: user.id,
      atualizado_em: new Date().toISOString()
    };
    
    if (existingConfig?.id) {
      // Atualizar configuração existente
      const { error: updateError } = await supabase
        .from('configuracoes_empresa')
        .update(configData)
        .eq('id', existingConfig.id);
      
      if (updateError) {
        console.error('Erro ao atualizar configurações:', updateError.message);
        return false;
      }
    } else {
      // Criar nova configuração
      const { error: insertError } = await supabase
        .from('configuracoes_empresa')
        .insert([{ 
          ...configData, 
          criado_em: new Date().toISOString() 
        }]);
      
      if (insertError) {
        console.error('Erro ao criar configurações:', insertError.message);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações da empresa:', error);
    return false;
  }
}; 