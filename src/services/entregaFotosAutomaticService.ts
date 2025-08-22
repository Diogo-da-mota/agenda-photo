import { supabase } from '@/integrations/supabase/client';

export interface EntregaFotosConfig {
  id?: string;
  user_id: string;
  enabled: boolean;
  message_template: string;
  days_after_event: number;
  created_at?: string;
  updated_at?: string;
}

export const getEntregaFotosConfig = async (userId: string): Promise<EntregaFotosConfig | null> => {
  const { data, error } = await supabase
    .from('entrega_fotos_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

export const saveEntregaFotosConfig = async (config: Omit<EntregaFotosConfig, 'id' | 'created_at' | 'updated_at'>): Promise<EntregaFotosConfig> => {
  const { data, error } = await supabase
    .from('entrega_fotos_config')
    .upsert({
      user_id: config.user_id,
      enabled: config.enabled,
      message_template: config.message_template,
      days_after_event: config.days_after_event
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const processarEntregaAutomatica = async (userId: string) => {
  console.log('Processando entrega automática para usuário:', userId);
  // Implementação básica
};

export const entregaFotosAutomaticService = {
  processarEntregaAutomatica,
  verificarEventosConcluidos: async (userId: string) => {
    console.log('Verificando eventos concluídos para usuário:', userId);
  },
  executarProcessosAutomaticos: async (userId?: string) => {
    console.log('Executando processos automáticos para usuário:', userId);
    return { sucessos: 0, falhas: 0 };
  }
};