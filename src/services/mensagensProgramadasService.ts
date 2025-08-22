import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { Database } from '@/types/supabase';

// Tipos para mensagens programadas
export type MensagemProgramada = Database['public']['Tables']['mensagens_programadas']['Row'];
export type MensagemProgramadaInsert = Database['public']['Tables']['mensagens_programadas']['Insert'];
export type MensagemProgramadaUpdate = Database['public']['Tables']['mensagens_programadas']['Update'];

// Status possíveis para mensagens programadas
export type StatusMensagemProgramada = 'pendente' | 'enviado' | 'erro' | 'cancelado';

// Interface para criar uma nova mensagem programada
export interface CriarMensagemProgramadaData {
  titulo: string;
  conteudo: string;
  telefone: string;
  data_programada: string;
  cliente_id?: string;
  template_id?: string;
  metadata?: Record<string, any>;
}

// Interface para filtros de busca
export interface FiltrosMensagensProgramadas {
  status?: StatusMensagemProgramada;
  data_inicio?: string;
  data_fim?: string;
  cliente_id?: string;
  template_id?: string;
  limite?: number;
  offset?: number;
}

/**
 * Serviço para gerenciar mensagens programadas
 */
export class MensagensProgramadasService {
  
  /**
   * Criar uma nova mensagem programada
   */
  static async criar(dados: CriarMensagemProgramadaData, userId: string): Promise<MensagemProgramada> {
    try {
      logger.info('Criando mensagem programada', { dados, userId });

      // Validar data programada
      const dataProgramada = new Date(dados.data_programada);
      const agora = new Date();
      
      if (dataProgramada <= agora) {
        throw new Error('A data programada deve ser no futuro');
      }

      // Validar telefone
      if (!dados.telefone || dados.telefone.trim().length === 0) {
        throw new Error('Telefone é obrigatório');
      }

      const dadosInsercao: MensagemProgramadaInsert = {
        user_id: userId,
        message: `${dados.titulo.trim()}\n\n${dados.conteudo.trim()}`,
        status: 'pendente'
      };

      const { data, error } = await supabase
        .from('mensagens_programadas')
        .insert(dadosInsercao)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar mensagem programada', { error, dados });
        throw new Error(`Erro ao criar mensagem programada: ${error.message}`);
      }

      logger.info('Mensagem programada criada com sucesso', { id: data.id });
      return data;

    } catch (error) {
      logger.error('Erro no serviço de criação de mensagem programada', { error, dados });
      throw error;
    }
  }

  /**
   * Buscar mensagens programadas do usuário
   */
  static async buscar(
    userId: string, 
    filtros: FiltrosMensagensProgramadas = {}
  ): Promise<MensagemProgramada[]> {
    try {
      logger.info('Buscando mensagens programadas', { userId, filtros });

      let query = supabase
        .from('mensagens_programadas')
        .select(`
          *,
          clientes:cliente_id(id, nome, telefone),
          mensagens_modelos:template_id(id, titulo)
        `)
        .eq('user_id', userId)
        .order('data_programada', { ascending: true });

      // Aplicar filtros
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      if (filtros.data_inicio) {
        query = query.gte('data_programada', filtros.data_inicio);
      }

      if (filtros.data_fim) {
        query = query.lte('data_programada', filtros.data_fim);
      }

      if (filtros.cliente_id) {
        query = query.eq('cliente_id', filtros.cliente_id);
      }

      if (filtros.template_id) {
        query = query.eq('template_id', filtros.template_id);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Erro ao buscar mensagens programadas', { error, userId, filtros });
        throw new Error(`Erro ao buscar mensagens programadas: ${error.message}`);
      }

      logger.info('Mensagens programadas encontradas', { count: data?.length || 0 });
      return data || [];

    } catch (error) {
      logger.error('Erro no serviço de busca de mensagens programadas', { error, userId, filtros });
      throw error;
    }
  }

  /**
   * Buscar mensagem programada por ID
   */
  static async buscarPorId(id: string, userId: string): Promise<MensagemProgramada | null> {
    try {
      logger.info('Buscando mensagem programada por ID', { id, userId });

      const { data, error } = await supabase
        .from('mensagens_programadas')
        .select(`
          *,
          clientes:cliente_id(id, nome, telefone),
          mensagens_modelos:template_id(id, titulo)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Mensagem programada não encontrada', { id, userId });
          return null;
        }
        logger.error('Erro ao buscar mensagem programada por ID', { error, id, userId });
        throw new Error(`Erro ao buscar mensagem programada: ${error.message}`);
      }

      return data;

    } catch (error) {
      logger.error('Erro no serviço de busca de mensagem programada por ID', { error, id, userId });
      throw error;
    }
  }

  /**
   * Atualizar mensagem programada
   */
  static async atualizar(
    id: string, 
    userId: string, 
    dados: Partial<MensagemProgramadaUpdate>
  ): Promise<MensagemProgramada> {
    try {
      logger.info('Atualizando mensagem programada', { id, userId, dados });

      // Validar se a mensagem pode ser atualizada
      const mensagemExistente = await this.buscarPorId(id, userId);
      if (!mensagemExistente) {
        throw new Error('Mensagem programada não encontrada');
      }

      if (mensagemExistente.status === 'enviado') {
        throw new Error('Não é possível atualizar uma mensagem já enviada');
      }

      if (mensagemExistente.status === 'cancelado') {
        throw new Error('Não é possível atualizar uma mensagem cancelada');
      }

      // Validar data programada se fornecida
      if (dados.data_programada) {
        const dataProgramada = new Date(dados.data_programada);
        const agora = new Date();
        
        if (dataProgramada <= agora) {
          throw new Error('A data programada deve ser no futuro');
        }
      }

      const { data, error } = await supabase
        .from('mensagens_programadas')
        .update(dados)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar mensagem programada', { error, id, userId, dados });
        throw new Error(`Erro ao atualizar mensagem programada: ${error.message}`);
      }

      logger.info('Mensagem programada atualizada com sucesso', { id });
      return data;

    } catch (error) {
      logger.error('Erro no serviço de atualização de mensagem programada', { error, id, userId, dados });
      throw error;
    }
  }

  /**
   * Cancelar mensagem programada
   */
  static async cancelar(id: string, userId: string): Promise<MensagemProgramada> {
    try {
      logger.info('Cancelando mensagem programada', { id, userId });

      const dados: MensagemProgramadaUpdate = {
        status: 'cancelado'
      };

      return await this.atualizar(id, userId, dados);

    } catch (error) {
      logger.error('Erro no serviço de cancelamento de mensagem programada', { error, id, userId });
      throw error;
    }
  }

  /**
   * Deletar mensagem programada
   */
  static async deletar(id: string, userId: string): Promise<void> {
    try {
      logger.info('Deletando mensagem programada', { id, userId });

      // Verificar se a mensagem pode ser deletada
      const mensagemExistente = await this.buscarPorId(id, userId);
      if (!mensagemExistente) {
        throw new Error('Mensagem programada não encontrada');
      }

      if (mensagemExistente.status === 'enviado') {
        throw new Error('Não é possível deletar uma mensagem já enviada');
      }

      const { error } = await supabase
        .from('mensagens_programadas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao deletar mensagem programada', { error, id, userId });
        throw new Error(`Erro ao deletar mensagem programada: ${error.message}`);
      }

      logger.info('Mensagem programada deletada com sucesso', { id });

    } catch (error) {
      logger.error('Erro no serviço de deleção de mensagem programada', { error, id, userId });
      throw error;
    }
  }

  /**
   * Buscar mensagens pendentes para processamento
   * (Usado pelo sistema de processamento automático)
   */
  static async buscarPendentes(limite: number = 50): Promise<MensagemProgramada[]> {
    try {
      logger.info('Buscando mensagens pendentes para processamento', { limite });

      const agora = new Date().toISOString();

      const { data, error } = await supabase
        .from('mensagens_programadas')
        .select('*')
        .eq('status', 'pendente')
        .lte('data_programada', agora)
        .order('data_programada', { ascending: true })
        .limit(limite);

      if (error) {
        logger.error('Erro ao buscar mensagens pendentes', { error });
        throw new Error(`Erro ao buscar mensagens pendentes: ${error.message}`);
      }

      logger.info('Mensagens pendentes encontradas', { count: data?.length || 0 });
      return data || [];

    } catch (error) {
      logger.error('Erro no serviço de busca de mensagens pendentes', { error });
      throw error;
    }
  }

  /**
   * Marcar mensagem como enviada
   */
  static async marcarComoEnviada(id: string): Promise<void> {
    try {
      logger.info('Marcando mensagem como enviada', { id });

      const { error } = await supabase
        .from('mensagens_programadas')
        .update({
          status: 'enviado'
        })
        .eq('id', id);

      if (error) {
        logger.error('Erro ao marcar mensagem como enviada', { error, id });
        throw new Error(`Erro ao marcar mensagem como enviada: ${error.message}`);
      }

      logger.info('Mensagem marcada como enviada com sucesso', { id });

    } catch (error) {
      logger.error('Erro no serviço de marcação como enviada', { error, id });
      throw error;
    }
  }

  /**
   * Marcar mensagem com erro
   */
  static async marcarComErro(id: string, erro: string): Promise<void> {
    try {
      logger.info('Marcando mensagem com erro', { id, erro });

      // Buscar mensagem atual para incrementar tentativas
      const { data: mensagem, error: errorBusca } = await supabase
        .from('mensagens_programadas')
        .select('*')
        .eq('id', id)
        .single();

      if (errorBusca) {
        logger.error('Erro ao buscar mensagem para marcar erro', { errorBusca, id });
        throw new Error(`Erro ao buscar mensagem: ${errorBusca.message}`);
      }

      const { error } = await supabase
        .from('mensagens_programadas')
        .update({
          status: 'erro'
        })
        .eq('id', id);

      if (error) {
        logger.error('Erro ao marcar mensagem com erro', { error, id });
        throw new Error(`Erro ao marcar mensagem com erro: ${error.message}`);
      }

      logger.info('Mensagem marcada com erro', { id });

    } catch (error) {
      logger.error('Erro no serviço de marcação com erro', { error, id });
      throw error;
    }
  }

  /**
   * Obter estatísticas das mensagens programadas do usuário
   */
  static async obterEstatisticas(userId: string): Promise<{
    total: number;
    pendentes: number;
    enviadas: number;
    erro: number;
    canceladas: number;
  }> {
    try {
      logger.info('Obtendo estatísticas de mensagens programadas', { userId });

      const { data, error } = await supabase
        .from('mensagens_programadas')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao obter estatísticas', { error, userId });
        throw new Error(`Erro ao obter estatísticas: ${error.message}`);
      }

      const estatisticas = {
        total: data.length,
        pendentes: data.filter(m => m.status === 'pendente').length,
        enviadas: data.filter(m => m.status === 'enviado').length,
        erro: data.filter(m => m.status === 'erro').length,
        canceladas: data.filter(m => m.status === 'cancelado').length
      };

      logger.info('Estatísticas obtidas', { estatisticas });
      return estatisticas;

    } catch (error) {
      logger.error('Erro no serviço de estatísticas', { error, userId });
      throw error;
    }
  }
}

// Exportar instância padrão para compatibilidade
export const mensagensProgramadasService = MensagensProgramadasService;