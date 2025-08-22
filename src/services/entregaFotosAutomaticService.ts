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
  // Mock implementation - return default config
  return {
    user_id: userId,
    enabled: false,
    message_template: 'Suas fotos estão prontas para download!',
    days_after_event: 7
  };
};

export const saveEntregaFotosConfig = async (config: Omit<EntregaFotosConfig, 'id' | 'created_at' | 'updated_at'>): Promise<EntregaFotosConfig> => {
  // Mock implementation - return the config as if saved
  return {
    id: 'mock-id',
    ...config,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const processarEntregaAutomatica = async (userId: string) => {
  console.log('Processando entrega automática para usuário:', userId);
  // Mock implementation
  return { processados: 0, enviados: 0 };
};

export const entregaFotosAutomaticService = {
  processarEntregaAutomatica,
  verificarEventosConcluidos: async (userId: string) => {
    console.log('Verificando eventos concluídos para usuário:', userId);
    return [];
  },
  executarProcessosAutomaticos: async (userId?: string) => {
    console.log('Executando processos automáticos para usuário:', userId);
    return { sucessos: 0, falhas: 0 };
  }
};