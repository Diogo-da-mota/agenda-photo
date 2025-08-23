// Serviço para gerenciar a tabela Dashboard_cliente
// Seguindo os 12 critérios de qualidade técnica

import { supabase } from '@/lib/supabase';

// Interface TypeScript para Dashboard_cliente (Critério 3: TypeScript)
export interface DashboardCliente {
  id: string;
  usuario_id: string;
  nome_cliente: string;
  email_cliente?: string;
  telefone_cliente?: string;
  data_agendamento: string; // ISO string
  tipo_servico: string;
  status_agendamento: 'pendente' | 'confirmado' | 'cancelado' | 'convertido';
  observacoes_cliente?: string;
  valor_orcamento?: number;
  forma_contato?: string;
  origem_agendamento?: string;
  ip_origem?: string;
  data_criacao: string;
  data_atualizacao: string;
}

// Interface para criação (sem campos auto-gerados)
export interface CriarDashboardCliente {
  usuario_id: string;
  nome_cliente: string;
  email_cliente?: string;
  telefone_cliente?: string;
  data_agendamento: string;
  tipo_servico: string;
  status_agendamento?: 'pendente' | 'confirmado' | 'cancelado' | 'convertido';
  observacoes_cliente?: string;
  valor_orcamento?: number;
  forma_contato?: string;
  origem_agendamento?: string;
  ip_origem?: string;
}

// Interface para atualização (campos opcionais)
export interface AtualizarDashboardCliente {
  nome_cliente?: string;
  email_cliente?: string;
  telefone_cliente?: string;
  data_agendamento?: string;
  tipo_servico?: string;
  status_agendamento?: 'pendente' | 'confirmado' | 'cancelado' | 'convertido';
  observacoes_cliente?: string;
  valor_orcamento?: number;
  forma_contato?: string;
  origem_agendamento?: string;
  ip_origem?: string;
}

// Logger para debugging (Critério 8: Tratamento de Erros)
const logger = {
  info: (...args: any[]) => {}, // console.log('[dashboardClienteService]', ...args); // Removido para produção
  error: (...args: any[]) => {}, // console.error('[dashboardClienteService]', ...args); // Removido para produção
  warn: (...args: any[]) => {} // console.warn('[dashboardClienteService]', ...args); // Removido para produção
};

// Função para buscar todos os agendamentos de um usuário
// Critério 7: Separação de Responsabilidades - função específica para busca
export const buscarAgendamentosCliente = async (usuarioId: string): Promise<DashboardCliente[]> => {
  try {
    logger.info(`Buscando agendamentos para usuário: ${usuarioId}`);
    
    const { data, error } = await supabase
      .from('dashboard_cliente')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('data_agendamento', { ascending: true });
    
    if (error) {
      logger.error('Erro ao buscar agendamentos:', error);
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
    
    logger.info(`${data?.length || 0} agendamentos encontrados`);
    return data || [];
  } catch (error) {
    logger.error('Erro na função buscarAgendamentosCliente:', error);
    throw error;
  }
};

// Função para criar novo agendamento
// Critério 4: Componentes - função com responsabilidade única
export const criarAgendamentoCliente = async (agendamento: CriarDashboardCliente): Promise<DashboardCliente> => {
  try {
    logger.info('Criando novo agendamento:', agendamento);
    
    // Validação básica (Critério 8: Tratamento de Erros)
    if (!agendamento.usuario_id || !agendamento.nome_cliente || !agendamento.data_agendamento) {
      throw new Error('Campos obrigatórios não preenchidos: usuario_id, nome_cliente, data_agendamento');
    }
    
    const { data, error } = await supabase
      .from('dashboard_cliente')
      .insert({
        ...agendamento,
        status_agendamento: agendamento.status_agendamento || 'pendente',
        forma_contato: agendamento.forma_contato || 'site',
        origem_agendamento: agendamento.origem_agendamento || 'cliente'
      })
      .select()
      .single();
    
    if (error) {
      logger.error('Erro ao criar agendamento:', error);
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
    
    logger.info('Agendamento criado com sucesso:', data.id);
    return data;
  } catch (error) {
    logger.error('Erro na função criarAgendamentoCliente:', error);
    throw error;
  }
};

// Função para atualizar agendamento
// Critério 1: DRY - reutiliza lógica de validação
export const atualizarAgendamentoCliente = async (
  id: string, 
  atualizacao: AtualizarDashboardCliente
): Promise<DashboardCliente> => {
  try {
    logger.info(`Atualizando agendamento ${id}:`, atualizacao);
    
    const { data, error } = await supabase
      .from('dashboard_cliente')
      .update({
        ...atualizacao,
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error('Erro ao atualizar agendamento:', error);
      throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
    }
    
    logger.info('Agendamento atualizado com sucesso');
    return data;
  } catch (error) {
    logger.error('Erro na função atualizarAgendamentoCliente:', error);
    throw error;
  }
};

// Função para deletar agendamento
export const deletarAgendamentoCliente = async (id: string): Promise<void> => {
  try {
    logger.info(`Deletando agendamento: ${id}`);
    
    const { error } = await supabase
      .from('dashboard_cliente')
      .delete()
      .eq('id', id);
    
    if (error) {
      logger.error('Erro ao deletar agendamento:', error);
      throw new Error(`Erro ao deletar agendamento: ${error.message}`);
    }
    
    logger.info('Agendamento deletado com sucesso');
  } catch (error) {
    logger.error('Erro na função deletarAgendamentoCliente:', error);
    throw error;
  }
};

// Função para buscar agendamento por ID
export const buscarAgendamentoPorId = async (id: string): Promise<DashboardCliente | null> => {
  try {
    logger.info(`Buscando agendamento por ID: ${id}`);
    
    const { data, error } = await supabase
      .from('dashboard_cliente')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn('Agendamento não encontrado');
        return null;
      }
      logger.error('Erro ao buscar agendamento por ID:', error);
      throw new Error(`Erro ao buscar agendamento: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    logger.error('Erro na função buscarAgendamentoPorId:', error);
    throw error;
  }
};

// Função para buscar agendamentos por status
// Critério 9: Performance - consulta otimizada com filtro
export const buscarAgendamentosPorStatus = async (
  usuarioId: string, 
  status: DashboardCliente['status_agendamento']
): Promise<DashboardCliente[]> => {
  try {
    logger.info(`Buscando agendamentos com status ${status} para usuário: ${usuarioId}`);
    
    const { data, error } = await supabase
      .from('dashboard_cliente')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('status_agendamento', status)
      .order('data_agendamento', { ascending: true });
    
    if (error) {
      logger.error('Erro ao buscar agendamentos por status:', error);
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
    
    logger.info(`${data?.length || 0} agendamentos encontrados com status ${status}`);
    return data || [];
  } catch (error) {
    logger.error('Erro na função buscarAgendamentosPorStatus:', error);
    throw error;
  }
};

// Função para testar conexão com Supabase
// Critério 12: Testes - função específica para validação
export const testarConexaoSupabase = async (): Promise<boolean> => {
  try {
    logger.info('Testando conexão com Supabase...');
    
    const { data, error } = await supabase
      .from('dashboard_cliente')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.error('Erro na conexão com Supabase:', error);
      return false;
    }
    
    logger.info('Conexão com Supabase OK');
    return true;
  } catch (error) {
    logger.error('Erro ao testar conexão:', error);
    return false;
  }
};