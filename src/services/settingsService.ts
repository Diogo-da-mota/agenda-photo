import { supabase } from '@/lib/supabase';
import { ConfiguracaoEmpresa } from './configuracaoEmpresaService';

/**
 * Obtém as configurações do app para o usuário atual
 * @returns Configurações do app ou null se não encontradas
 */
export const getSettings = async (): Promise<ConfiguracaoEmpresa | null> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Usuário não autenticado');
      }
      return null;
    }
    
    // Usar a tabela configuracoes_empresa
    const { data, error } = await supabase
      .from('configuracoes_empresa')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Log apenas em desenvolvimento
        if (import.meta.env.MODE === 'development') {
          console.warn('Nenhuma configuração encontrada para o usuário:', user.id);
        }
        return null;
      }
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao obter configurações:', error.message);
      }
      return null;
    }
    
    return data as ConfiguracaoEmpresa;
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao carregar configurações:', error);
    }
    return null;
  }
};

/**
 * Salva as configurações do app
 * @param settings Configurações a serem salvas
 * @returns true se as configurações foram salvas com sucesso, false caso contrário
 */
export const saveSettings = async (settings: Partial<ConfiguracaoEmpresa>): Promise<boolean> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Usuário não autenticado');
      }
      return false;
    }
    
    // Verificar se já existe configuração para o usuário
    const { data: existingSettings, error: fetchError } = await supabase
      .from('configuracoes_empresa')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao verificar configurações existentes:', fetchError.message);
      }
      return false;
    }
    
    // Preparar dados para salvar
    const updatedSettings = {
      ...existingSettings,
      ...settings,
      user_id: user.id,
      atualizado_em: new Date().toISOString()
    };
    
    let result;
    
    // Inserir ou atualizar configurações
    if (existingSettings?.id) {
      // Atualizar registro existente
      result = await supabase
        .from('configuracoes_empresa')
        .update(updatedSettings)
        .eq('id', existingSettings.id);
    } else {
      // Criar novo registro
      result = await supabase
        .from('configuracoes_empresa')
        .insert([{ ...updatedSettings, criado_em: new Date().toISOString() }]);
    }
    
    if (result.error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao salvar configurações:', result.error.message);
      }
      return false;
    }
    
    return true;
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao salvar configurações:', error);
    }
    return false;
  }
};

// Re-exportar a interface ConfiguracaoEmpresa
export type { ConfiguracaoEmpresa };
