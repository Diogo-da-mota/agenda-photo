// Types
export interface MensagemProgramada {
  id: string;
  telefone: string;
  conteudo_mensagem: string;
  data_envio: string;
  status: string;
  user_id: string;
  evento_id?: string;
  created_at: string;
  updated_at: string;
  data_programada?: string;
  erro_detalhes?: string;
  tentativas_envio?: number;
  metadata?: any;
}

export interface CriarMensagemProgramadaData {
  telefone: string;
  conteudo_mensagem: string;
  data_envio: string;
  evento_id?: string;
}

export interface FiltrosMensagensProgramadas {
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}

// Service implementation
export const MensagensProgramadasService = {
  listar: async (userId: string, filtros?: FiltrosMensagensProgramadas) => {
    return { mensagens: [] };
  },
  
  excluir: async (id: string, userId: string) => {
    return { success: true };
  },

  cancelar: async (id: string, userId: string) => {
    return { success: true };
  },

  criar: async (data: CriarMensagemProgramadaData, userId: string) => {
    return { success: true };
  },

  obterEstatisticas: async (userId: string) => {
    return {
      total: 0,
      pendentes: 0,
      enviadas: 0,
      erro: 0,
      canceladas: 0
    };
  }
};

export default MensagensProgramadasService;