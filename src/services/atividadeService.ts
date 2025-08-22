import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// Interface para as atividades usando a estrutura da tabela sistema_atividades
export interface Atividade {
  id?: string;
  table_name: string;
  operation: string;
  timestamp?: string;
  record_id?: string;
  user_id?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
}

// Interface para atividades formatadas para o componente
export interface AtividadeFormatada {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'client' | 'schedule' | 'payment' | 'contract' | 'other';
  status: 'completed' | 'pending' | 'canceled' | 'important';
}

// Tipos de atividades baseados na estrutura da tabela sistema_atividades
export const TIPOS_ATIVIDADE = {
  CLIENTE_CRIADO: 'INSERT_clientes',
  PAGAMENTO_RECEBIDO: 'INSERT_transacoes_financeiras',
  EVENTO_AGENDADO: 'INSERT_agenda_eventos',
  EVENTO_ATUALIZADO: 'UPDATE_agenda_eventos',
  TRANSACAO_CRIADA: 'INSERT_financeiro_transacoes',
  DESPESA_REGISTRADA: 'INSERT_financeiro_despesas',
  CONTRATO_CRIADO: 'INSERT_contratos'
} as const;

/**
 * Registra uma nova atividade no sistema usando a tabela sistema_atividades
 */
export const registrarAtividade = async (
  tableName: string,
  operation: string,
  userId: string,
  newData?: Record<string, any>,
  oldData?: Record<string, any>,
  recordId?: string
): Promise<void> => {
  try {
    logger.debug('Registrando nova atividade', { tableName, operation }, 'atividadeService');
    
    // Validação básica
    if (!tableName || !operation || !userId) {
      logger.error('Dados incompletos para registrar atividade', { tableName, operation, userId }, 'atividadeService');
      return; // Falha silenciosa para não afetar o fluxo principal
    }

    const { error } = await supabase
      .from('sistema_atividades')
      .insert([{
        table_name: tableName,
        operation: operation,
        user_id: userId,
        record_id: recordId,
        new_data: newData,
        old_data: oldData
      }]);

    if (error) {
      logger.error('Erro ao registrar atividade', error, 'atividadeService');
      // Falha silenciosa para não interromper o fluxo principal
    } else {
      logger.debug('Atividade registrada com sucesso', { tableName, operation }, 'atividadeService');
    }
  } catch (error) {
    logger.error('Exceção ao registrar atividade', error, 'atividadeService');
    // Falha silenciosa para não interromper o fluxo principal
  }
};

/**
 * Busca as atividades recentes de um usuário
 */
export const buscarAtividades = async (userId: string, limite: number = 10): Promise<AtividadeFormatada[]> => {
  try {
    logger.debug('Buscando atividades recentes', { userId, limite }, 'atividadeService');
    
    if (!userId) {
      logger.error('ID de usuário não fornecido', null, 'atividadeService');
      return [];
    }

    const { data, error } = await supabase
      .from('sistema_atividades')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limite);

    if (error) {
      logger.error('Erro ao buscar atividades', error, 'atividadeService');
      return [];
    }

    logger.debug(`${data?.length || 0} atividades encontradas`, null, 'atividadeService');
    
    // Converter para formato do componente
    return (data || []).map((item: any) => ({
      id: item.id,
      title: `${item.operation} realizada em ${item.table_name}`,
      description: `${item.operation} realizada em ${item.table_name}`,
      timestamp: item.timestamp,
      type: 'other' as const,
      status: 'completed' as const
    }));
  } catch (error) {
    logger.error('Exceção ao buscar atividades', error, 'atividadeService');
    return [];
  }
};

// Interface para o histórico do contrato (compatível com ContractHistory component)
export interface HistoricoContrato {
  date: Date;
  action: string;
  type?: 'created' | 'sent' | 'viewed' | 'signed' | 'expired' | 'canceled' | 'reminder';
}

/**
 * Busca o histórico de atividades de um contrato específico
 */
export const buscarHistoricoContrato = async (contratoId: string, userId: string): Promise<HistoricoContrato[]> => {
  try {
    logger.debug('buscarHistoricoContrato: Iniciando busca', { contratoId, userId }, 'atividadeService');
    
    if (!contratoId || !userId) {
      logger.error('ID do contrato ou usuário não fornecido', { contratoId, userId }, 'atividadeService');
      return [];
    }

    // Primeiro, buscar o UUID do contrato usando o id_contrato (slug)
    // Extrair apenas a parte numérica do slug se necessário
    const idContratoNumerico = contratoId.includes('-') ? contratoId.split('-').pop() : contratoId;
    
    const { data: contratoData, error: contratoError } = await supabase
      .from('contratos')
      .select('id')
      .eq('id_contrato', idContratoNumerico)
      .single();

    if (contratoError) {
      logger.error('buscarHistoricoContrato: Contrato não encontrado', { contratoId, idContratoNumerico, error: contratoError }, 'atividadeService');
      return [];
    }

    if (!contratoData?.id) {
      logger.error('buscarHistoricoContrato: UUID do contrato não encontrado', { contratoId, idContratoNumerico }, 'atividadeService');
      return [];
    }

    // Agora buscar o histórico usando o UUID do contrato
    const { data, error } = await supabase
      .from('sistema_atividades')
      .select('*')
      .eq('user_id', userId)
      .eq('table_name', 'contratos')
      .eq('record_id', contratoData.id)
      .order('timestamp', { ascending: false });

    if (error) {
      logger.error('buscarHistoricoContrato: Erro na consulta Supabase', { error, contratoId, userId }, 'atividadeService');
      return [];
    }

    logger.debug('buscarHistoricoContrato: Dados brutos encontrados', { 
      contratoId, 
      userId, 
      count: data?.length || 0,
      data: data?.slice(0, 3) // Log apenas os primeiros 3 para debug
    }, 'atividadeService');
    
    // Converter para formato do componente ContractHistory
    const resultado = (data || []).map((item: any) => formatarAtividadeParaHistoricoContrato({
      id: item.id,
      table_name: item.table_name,
      operation: item.operation,
      timestamp: item.timestamp,
      record_id: item.record_id,
      user_id: item.user_id,
      old_data: item.old_data as Record<string, any>,
      new_data: item.new_data as Record<string, any>
    }));
    
    logger.debug('buscarHistoricoContrato: Resultado formatado', { 
      contratoId, 
      count: resultado.length,
      items: resultado.slice(0, 3) // Log apenas os primeiros 3 para debug
    }, 'atividadeService');
    
    return resultado;
  } catch (error) {
    logger.error('buscarHistoricoContrato: Erro geral', { error, contratoId, userId }, 'atividadeService');
    return [];
  }
};

/**
 * Converte uma atividade para o formato do histórico do contrato
 */
const formatarAtividadeParaHistoricoContrato = (atividade: Atividade): HistoricoContrato => {
  const { operation } = atividade;
  
  let action = '';
  let type: HistoricoContrato['type'] = 'created';
  
  switch (operation) {
    case 'INSERT':
      action = 'Contrato criado';
      type = 'created';
      break;
    case 'UPDATE':
      // Verificar se foi uma mudança de status
      const newData = atividade.new_data;
      const oldData = atividade.old_data;
      
      if (newData?.status && newData.status !== oldData?.status) {
        switch (newData.status) {
          case 'assinado':
            action = 'Contrato assinado';
            type = 'signed';
            break;
          case 'cancelado':
            action = 'Contrato cancelado';
            type = 'canceled';
            break;
          case 'expirado':
            action = 'Contrato expirado';
            type = 'expired';
            break;
          default:
            action = 'Contrato atualizado';
            type = 'created';
        }
      } else {
        action = 'Contrato atualizado';
        type = 'created';
      }
      break;
    default:
      action = 'Atividade registrada';
      type = 'created';
  }
  
  return {
    date: new Date(atividade.timestamp || new Date()),
    action,
    type
  };
};

/**
 * Converte uma atividade da estrutura do banco para a estrutura do componente
 */
const formatarAtividadeParaComponente = (atividade: Atividade): AtividadeFormatada => {
  const { title, description, type, status } = obterInformacoesPorOperacao(atividade);
  
  return {
    id: atividade.id || '',
    title,
    description,
    timestamp: formatarTempoRelativo(atividade.timestamp || ''),
    type,
    status
  };
};

/**
 * Obtém informações formatadas baseadas na operação e tabela
 */
const obterInformacoesPorOperacao = (atividade: Atividade): {
  title: string;
  description: string;
  type: 'client' | 'schedule' | 'payment' | 'contract' | 'other';
  status: 'completed' | 'pending' | 'canceled' | 'important';
} => {
  const { table_name, operation, new_data } = atividade;
  const operacao = `${operation}_${table_name}`;
  
  switch (operacao) {
    case 'INSERT_clientes':
      return {
        title: 'Novo Cliente',
        description: `Cliente ${new_data?.nome || 'adicionado'} foi criado`,
        type: 'client',
        status: 'completed'
      };
      
    case 'INSERT_agenda_eventos':
      return {
        title: 'Evento Agendado',
        description: `Evento "${new_data?.titulo || 'novo evento'}" foi agendado`,
        type: 'schedule',
        status: 'completed'
      };
      
    case 'UPDATE_agenda_eventos':
      return {
        title: 'Evento Atualizado',
        description: `Evento "${new_data?.titulo || 'atualizado'}" foi modificado`,
        type: 'schedule',
        status: 'completed'
      };
      
    case 'INSERT_financeiro_transacoes':
    case 'INSERT_transacoes_financeiras':
      return {
        title: 'Nova Transação',
        description: `Transação de R$ ${new_data?.valor || '0,00'} registrada`,
        type: 'payment',
        status: 'completed'
      };
      
    case 'INSERT_contratos':
      return {
        title: 'Contrato Criado',
        description: `Contrato para ${new_data?.titulo || new_data?.cliente || 'cliente'} foi criado`,
        type: 'contract',
        status: 'completed'
      };
      
    case 'INSERT_financeiro_despesas':
      return {
        title: 'Despesa Registrada',
        description: `Despesa: ${new_data?.descricao || 'Nova despesa'} - R$ ${new_data?.valor || '0,00'}`,
        type: 'payment',
        status: 'completed'
      };

    case 'INSERT_portfolio_trabalhos':
      return {
        title: 'Trabalho Adicionado',
        description: `"${new_data?.titulo || 'Novo trabalho'}" foi adicionado ao portfólio`,
        type: 'other',
        status: 'completed'
      };

    case 'INSERT_mensagens_modelos':
      return {
        title: 'Template Criado',
        description: `Template "${new_data?.titulo || 'novo template'}" foi criado`,
        type: 'other',
        status: 'completed'
      };

    case 'UPDATE_configuracoes_empresa':
      return {
        title: 'Configurações Atualizadas',
        description: `Configurações da empresa foram atualizadas`,
        type: 'other',
        status: 'completed'
      };
      
    default:
      return {
        title: 'Atividade do Sistema',
        description: `${operation} realizada em ${table_name}`,
        type: 'other',
        status: 'completed'
      };
  }
};

/**
 * Formata a descrição da atividade para exibição (mantido para compatibilidade)
 */
export const formatarDescricaoAtividade = (atividade: Atividade): string => {
  const info = obterInformacoesPorOperacao(atividade);
  // Truncar descrições muito longas
  if (info.description.length > 100) {
    return info.description.substring(0, 97) + '...';
  }
  return info.description;
};

/**
 * Obtém o ícone apropriado para o tipo de atividade (mantido para compatibilidade)
 */
export const obterIconeAtividade = (operacao: string): string => {
  switch (operacao) {
    case 'INSERT_clientes':
      return '👤';
    case 'INSERT_financeiro_transacoes':
    case 'INSERT_transacoes_financeiras':
      return '💰';
    case 'INSERT_agenda_eventos':
      return '📅';
    case 'UPDATE_agenda_eventos':
      return '✏️';
    case 'INSERT_financeiro_despesas':
      return '🧾';
    case 'INSERT_contratos':
      return '📄';
    case 'INSERT_portfolio_trabalhos':
      return '🖼️';
    case 'INSERT_mensagens_modelos':
      return '💬';
    case 'UPDATE_configuracoes_empresa':
      return '⚙️';
    default:
      return '📋';
  }
};

/**
 * Formata o tempo relativo da atividade
 */
export const formatarTempoRelativo = (dataIso: string): string => {
  const agora = new Date();
  const data = new Date(dataIso);
  const diffMs = agora.getTime() - data.getTime();
  const diffMinutos = Math.floor(diffMs / (1000 * 60));
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutos < 1) return 'Agora mesmo';
  if (diffMinutos < 60) return `${diffMinutos}m atrás`;
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  if (diffDias < 7) return `${diffDias}d atrás`;
  
  return data.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
};

// Funções auxiliares para registrar atividades específicas
export const registrarClienteCriado = async (userId: string, nomeCliente: string, clienteId?: string) => {
  await registrarAtividade(
    'clientes',
    'INSERT',
    userId,
    { nome: nomeCliente },
    undefined,
    clienteId
  );
};

export const registrarEventoAgendado = async (userId: string, tituloEvento: string, eventoId?: string) => {
  await registrarAtividade(
    'agenda_eventos',
    'INSERT',
    userId,
    { titulo: tituloEvento },
    undefined,
    eventoId
  );
};

export const registrarTransacaoCriada = async (userId: string, valor: number, tipo: string, transacaoId?: string) => {
  await registrarAtividade(
    'financeiro_transacoes',
    'INSERT',
    userId,
    { valor, tipo },
    undefined,
    transacaoId
  );
};

export const registrarContratoCriado = async (userId: string, tituloContrato: string, contratoId?: string) => {
  await registrarAtividade(
    'contratos',
    'INSERT',
    userId,
    { titulo: tituloContrato },
    undefined,
    contratoId
  );
};

export const registrarDespesaRegistrada = async (userId: string, valor: number, descricao: string, despesaId?: string) => {
  await registrarAtividade(
    'financeiro_despesas',
    'INSERT',
    userId,
    { valor, descricao },
    undefined,
    despesaId
  );
};

// Função para criar atividades de exemplo/teste (apenas para desenvolvimento)
export const criarAtividadesExemplo = async (userId: string): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    logger.warn('Tentativa de criar atividades de exemplo em produção bloqueada', null, 'atividadeService');
    return;
  }

  try {
    const exemplos = [
      {
        table_name: 'clientes',
        operation: 'INSERT',
        new_data: { nome: 'Maria Silva' }
      },
      {
        table_name: 'agenda_eventos',
        operation: 'INSERT',
        new_data: { titulo: 'Casamento João & Ana' }
      },
      {
        table_name: 'financeiro_transacoes',
        operation: 'INSERT',
        new_data: { valor: 2500, tipo: 'entrada' }
      },
      {
        table_name: 'contratos',
        operation: 'INSERT',
        new_data: { titulo: 'Contrato Pedro Oliveira' }
      },
      {
        table_name: 'financeiro_despesas',
        operation: 'INSERT',
        new_data: { valor: 350, descricao: 'Equipamento fotográfico' }
      }
    ];

    for (const exemplo of exemplos) {
      await registrarAtividade(
        exemplo.table_name,
        exemplo.operation,
        userId,
        exemplo.new_data
      );
      
      // Pequeno delay para criar timestamps diferentes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('Atividades de exemplo criadas com sucesso', { quantidade: exemplos.length }, 'atividadeService');
  } catch (error) {
    logger.error('Erro ao criar atividades de exemplo', error, 'atividadeService');
  }
};
