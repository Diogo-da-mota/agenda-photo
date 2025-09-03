import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// Tipos para orçamento
export interface SolicitacaoOrcamento {
  id?: string;
  numero_referencia?: string;
  user_id?: string;
  nome_completo: string;
  email: string;
  telefone: string;
  tipo_evento: string;
  data_pretendida?: Date | null;
  local_evento?: string;
  numero_participantes?: number | null;
  duracao_estimada?: string;
  detalhes_adicionais?: string;
  status?: 'pendente' | 'em_analise' | 'respondido' | 'cancelado';
  data_criacao?: Date;
  data_atualizacao?: Date;
}

export interface TipoEvento {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  ordem_exibicao: number;
}

export interface RespostaOrcamento {
  id?: string;
  solicitacao_id: string;
  valor_proposto?: number;
  descricao_servicos?: string;
  condicoes_pagamento?: string;
  prazo_validade?: Date;
  observacoes_internas?: string;
  criado_por?: string;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

// Converter dados do frontend para Supabase
const converterParaSupabase = (orcamento: SolicitacaoOrcamento, userId: string) => {
  return {
    user_id: userId,
    nome_completo: orcamento.nome_completo,
    email: orcamento.email,
    telefone: orcamento.telefone.replace(/\D/g, ''), // Remove caracteres não numéricos
    tipo_evento: orcamento.tipo_evento,
    data_pretendida: orcamento.data_pretendida?.toISOString().split('T')[0] || null,
    local_evento: orcamento.local_evento || null,
    numero_participantes: orcamento.numero_participantes || null,
    duracao_estimada: orcamento.duracao_estimada || null,
    detalhes_adicionais: orcamento.detalhes_adicionais || null,
    status: orcamento.status || 'pendente'
  };
};

// Converter dados do Supabase para frontend
const converterDoSupabase = (data: any): SolicitacaoOrcamento => {
  return {
    id: data.id,
    numero_referencia: data.numero_referencia,
    user_id: data.user_id,
    nome_completo: data.nome_completo,
    email: data.email,
    telefone: data.telefone,
    tipo_evento: data.tipo_evento,
    data_pretendida: data.data_pretendida ? new Date(data.data_pretendida) : null,
    local_evento: data.local_evento,
    numero_participantes: data.numero_participantes,
    duracao_estimada: data.duracao_estimada,
    detalhes_adicionais: data.detalhes_adicionais,
    status: data.status,
    data_criacao: data.data_criacao ? new Date(data.data_criacao) : undefined,
    data_atualizacao: data.data_atualizacao ? new Date(data.data_atualizacao) : undefined
  };
};

// Serviço de orçamentos
export const orcamentoService = {
  // Criar nova solicitação de orçamento
  async criarSolicitacao(orcamento: SolicitacaoOrcamento, userId: string): Promise<SolicitacaoOrcamento> {
    try {
      logger.info('[orcamentoService] Criando nova solicitação de orçamento');
      
      const dadosSupabase = converterParaSupabase(orcamento, userId);
      
      const { data, error } = await supabase
        .from('solicitacoes_orcamento')
        .insert([dadosSupabase])
        .select()
        .single();

      if (error) {
        logger.error('[orcamentoService] Erro ao criar solicitação:', error);
        throw new Error(`Erro ao criar solicitação de orçamento: ${error.message}`);
      }

      logger.info('[orcamentoService] Solicitação criada com sucesso:', data);
      return converterDoSupabase(data);
    } catch (error) {
      logger.error('[orcamentoService] Erro inesperado ao criar solicitação:', error);
      throw error;
    }
  },

  // Buscar solicitações do usuário
  async buscarSolicitacoes(userId: string): Promise<SolicitacaoOrcamento[]> {
    try {
      logger.info('[orcamentoService] Buscando solicitações do usuário:', userId);
      
      const { data, error } = await supabase
        .from('solicitacoes_orcamento')
        .select('*')
        .eq('user_id', userId)
        .order('data_criacao', { ascending: false });

      if (error) {
        logger.error('[orcamentoService] Erro ao buscar solicitações:', error);
        throw new Error(`Erro ao buscar solicitações: ${error.message}`);
      }

      return data?.map(converterDoSupabase) || [];
    } catch (error) {
      logger.error('[orcamentoService] Erro inesperado ao buscar solicitações:', error);
      throw error;
    }
  },

  // Buscar solicitação por ID
  async buscarSolicitacaoPorId(id: string): Promise<SolicitacaoOrcamento | null> {
    try {
      logger.info('[orcamentoService] Buscando solicitação por ID:', id);
      
      const { data, error } = await supabase
        .from('solicitacoes_orcamento')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        logger.error('[orcamentoService] Erro ao buscar solicitação:', error);
        throw new Error(`Erro ao buscar solicitação: ${error.message}`);
      }

      return converterDoSupabase(data);
    } catch (error) {
      logger.error('[orcamentoService] Erro inesperado ao buscar solicitação:', error);
      throw error;
    }
  },

  // Atualizar status da solicitação
  async atualizarStatus(id: string, status: 'pendente' | 'em_analise' | 'respondido' | 'cancelado'): Promise<void> {
    try {
      logger.info('[orcamentoService] Atualizando status da solicitação:', id, status);
      
      const { error } = await supabase
        .from('solicitacoes_orcamento')
        .update({ status })
        .eq('id', id);

      if (error) {
        logger.error('[orcamentoService] Erro ao atualizar status:', error);
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      logger.info('[orcamentoService] Status atualizado com sucesso');
    } catch (error) {
      logger.error('[orcamentoService] Erro inesperado ao atualizar status:', error);
      throw error;
    }
  },

  // Buscar tipos de evento
  async buscarTiposEvento(): Promise<TipoEvento[]> {
    try {
      logger.info('[orcamentoService] Buscando tipos de evento');
      
      const { data, error } = await supabase
        .from('tipos_evento')
        .select('*')
        .eq('ativo', true)
        .order('ordem_exibicao', { ascending: true });

      if (error) {
        logger.error('[orcamentoService] Erro ao buscar tipos de evento:', error);
        throw new Error(`Erro ao buscar tipos de evento: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('[orcamentoService] Erro inesperado ao buscar tipos de evento:', error);
      throw error;
    }
  },

  // Criar resposta para orçamento (para administradores)
  async criarResposta(resposta: RespostaOrcamento): Promise<RespostaOrcamento> {
    try {
      logger.info('[orcamentoService] Criando resposta de orçamento');
      
      const { data, error } = await supabase
        .from('respostas_orcamento')
        .insert([{
          solicitacao_id: resposta.solicitacao_id,
          valor_proposto: resposta.valor_proposto,
          descricao_servicos: resposta.descricao_servicos,
          condicoes_pagamento: resposta.condicoes_pagamento,
          prazo_validade: resposta.prazo_validade?.toISOString().split('T')[0],
          observacoes_internas: resposta.observacoes_internas,
          criado_por: resposta.criado_por
        }])
        .select()
        .single();

      if (error) {
        logger.error('[orcamentoService] Erro ao criar resposta:', error);
        throw new Error(`Erro ao criar resposta: ${error.message}`);
      }

      // Atualizar status da solicitação para 'respondido'
      await this.atualizarStatus(resposta.solicitacao_id, 'respondido');

      logger.info('[orcamentoService] Resposta criada com sucesso');
      return {
        ...resposta,
        id: data.id,
        data_criacao: new Date(data.data_criacao),
        data_atualizacao: new Date(data.data_atualizacao)
      };
    } catch (error) {
      logger.error('[orcamentoService] Erro inesperado ao criar resposta:', error);
      throw error;
    }
  },

  // Buscar respostas de uma solicitação
  async buscarRespostas(solicitacaoId: string): Promise<RespostaOrcamento[]> {
    try {
      logger.info('[orcamentoService] Buscando respostas da solicitação:', solicitacaoId);
      
      const { data, error } = await supabase
        .from('respostas_orcamento')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('data_criacao', { ascending: false });

      if (error) {
        logger.error('[orcamentoService] Erro ao buscar respostas:', error);
        throw new Error(`Erro ao buscar respostas: ${error.message}`);
      }

      return data?.map(item => ({
        id: item.id,
        solicitacao_id: item.solicitacao_id,
        valor_proposto: item.valor_proposto,
        descricao_servicos: item.descricao_servicos,
        condicoes_pagamento: item.condicoes_pagamento,
        prazo_validade: item.prazo_validade ? new Date(item.prazo_validade) : undefined,
        observacoes_internas: item.observacoes_internas,
        criado_por: item.criado_por,
        data_criacao: item.data_criacao ? new Date(item.data_criacao) : undefined,
        data_atualizacao: item.data_atualizacao ? new Date(item.data_atualizacao) : undefined
      })) || [];
    } catch (error) {
      logger.error('[orcamentoService] Erro inesperado ao buscar respostas:', error);
      throw error;
    }
  }
};

export default orcamentoService;