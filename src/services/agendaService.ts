// Arquivo refatorado - agora usando sistema modular
// Mantém compatibilidade total com versão anterior

// Importações necessárias
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import * as clientService from './clientService';
import { invalidateAfterCRUD } from '@/lib/react-query-config';
import { Event } from '@/components/agenda/types';

// Types para agenda
interface EventoSupabase {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  local?: string;
  observacoes?: string;
  telefone?: string;
  status: string;
  notificacao_enviada?: boolean;
  user_id: string;
  cor?: string;
  cliente_id?: string;
  criado_em: string;
  atualizado_em: string;
  descricao?: string;
  data_nascimento?: string; // ✅ NOVO: Campo para data de nascimento
  // Campos financeiros (podem não existir fisicamente na tabela)
  valor_total?: number;
  valor_entrada?: number;
  valor_restante?: number;
  // Novos campos adicionados
  cpf_cliente?: string;
  endereco_cliente?: string;
  [key: string]: any; // Adicionar flexibilidade para campos dinâmicos
}

// Tipo para eventos de calendário
export interface EventoCalendario {
  id: string;
  titulo: string;
  data_inicio: Date;
  data_fim: Date;
  status: string;
  cor?: string;
}

// Logger simples - removido para produção
const logger = {
  info: (...args: any[]) => {}, // console.log('[agendaService]', ...args), // Removido para produção
  error: (...args: any[]) => {}, // console.error('[agendaService]', ...args), // Removido para produção
  warn: (...args: any[]) => {} // console.warn('[agendaService]', ...args) // Removido para produção
};

// Sistema de cache e debounce para otimização de requisições
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestOptimizer {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private readonly DEFAULT_TTL = 30000; // 30 segundos

  // Limpar cache expirado
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        logger.info(`[RequestOptimizer] Cache expirado removido: ${key}`);
      }
    }
  }

  // Limpar requisições pendentes antigas
  private cleanExpiredPendingRequests(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > 60000) { // 1 minuto
        this.pendingRequests.delete(key);
        logger.warn(`[RequestOptimizer] Requisição pendente expirada removida: ${key}`);
      }
    }
  }

  // Obter dados do cache ou executar função
  async getOrExecute<T>(
    key: string,
    executeFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    this.cleanExpiredCache();
    this.cleanExpiredPendingRequests();

    // Verificar cache
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      logger.info(`[RequestOptimizer] Dados obtidos do cache: ${key}`);
      return cached.data;
    }

    // Verificar se já existe uma requisição pendente
    const pending = this.pendingRequests.get(key);
    if (pending) {
      logger.info(`[RequestOptimizer] Aguardando requisição pendente: ${key}`);
      return pending.promise;
    }

    // Executar nova requisição
    logger.info(`[RequestOptimizer] Executando nova requisição: ${key}`);
    const promise = executeFn();
    
    // Armazenar como pendente
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    try {
      const result = await promise;
      
      // Armazenar no cache
      this.cache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl
      });
      
      logger.info(`[RequestOptimizer] Resultado armazenado no cache: ${key}`);
      return result;
    } catch (error) {
      logger.error(`[RequestOptimizer] Erro na requisição: ${key}`, error);
      throw error;
    } finally {
      // Remover da lista de pendentes
      this.pendingRequests.delete(key);
    }
  }

  // Invalidar cache específico
  invalidateCache(key: string): void {
    this.cache.delete(key);
    logger.info(`[RequestOptimizer] Cache invalidado: ${key}`);
  }

  // Limpar todo o cache
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    logger.info(`[RequestOptimizer] Todo o cache foi limpo`);
  }

  // Obter estatísticas do cache
  getCacheStats(): { cacheSize: number; pendingRequests: number } {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Instância global do otimizador de requisições
const requestOptimizer = new RequestOptimizer();

// Função para invalidar cache específico (útil após atualizações)
export const invalidarCacheEventos = (userId: string) => {
  const cacheKeys = [
    `eventos_valores_entradas_${userId}`,
    `eventos_valores_restantes_${userId}`
  ];
  
  cacheKeys.forEach(key => {
    requestOptimizer.invalidateCache(key);
    logger.info(`[Cache] Cache invalidado para chave: ${key}`);
  });
};

// Função auxiliar para extrair data de nascimento da descrição
const extrairDataNascimento = (descricao?: string | null): string | null => {
  if (!descricao || !descricao.includes('Aniversário:')) {
    return null;
  }
  
  const match = descricao.match(/Aniversário:\s*(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
};

// Variável para callback de atualização financeira
let atualizarContextoFinanceiro: ((userId: string) => void) | null = null;

// Função para mapear status para backend
const mapearStatusParaBackend = (status: string): string => {
  const mapeamento: Record<string, string> = {
    'pending': 'agendado',
    'confirmed': 'confirmado', 
    'completed': 'concluido',
    'canceled': 'cancelado',
    'upcoming': 'agendado'
  };
  return mapeamento[status] || 'agendado';
};

// Função para mapear status para frontend
const mapearStatusParaFrontend = (status: string): 'pending' | 'confirmed' | 'completed' | 'canceled' | 'upcoming' | 'past' => {
  const mapeamento: Record<string, 'pending' | 'confirmed' | 'completed' | 'canceled' | 'upcoming' | 'past'> = {
    'agendado': 'pending',
    'confirmado': 'confirmed',
    'concluido': 'completed', 
    'cancelado': 'canceled',
    'proximo': 'upcoming',
    'past': 'past'
  };
  return mapeamento[status] || 'pending';
};

// Converter evento do frontend para o formato do Supabase
export const converterParaSupabase = (evento: Event, userId: string): Omit<EventoSupabase, 'id'> => {
  // Validar data de início
  if (!evento.date || isNaN(evento.date.getTime())) {
    logger.error('[converterParaSupabase] Data de início inválida:', evento.date);
    throw new Error(`Data de início inválida: ${evento.date}`);
  }

  // Calcula data_fim: adiciona 1 hora à data de início como padrão
  const dataInicio = new Date(evento.date);
  const dataFim = new Date(dataInicio);
  dataFim.setHours(dataFim.getHours() + 1);

  // Validar data de aniversário se existir
  if (evento.birthday && isNaN(evento.birthday.getTime())) {
    logger.error('[converterParaSupabase] Data de aniversário inválida:', evento.birthday);
    throw new Error(`Data de aniversário inválida: ${evento.birthday}`);
  }

  // Timestamp atual para criado_em e atualizado_em
  const agora = new Date().toISOString();

  // Mapear status para cores (com validação) - Cores baseadas nos status dos cards
  let cor = null;
  switch (evento.status) {
    case 'pending':
      cor = '#3b82f6'; // Azul (Aguardando)
      break;
    case 'confirmed':
      cor = '#10b981'; // Verde (Confirmados)
      break;
    case 'completed':
      cor = '#8b5cf6'; // Roxo (Concluídos)
      break;
    case 'canceled':
      cor = '#6b7280'; // Cinza (Cancelados)
      break;
    case 'upcoming':
      cor = '#f59e0b'; // Âmbar (Próximos)
      break;
    case 'past':
      cor = '#ef4444'; // Vermelho (Passados)
      break;
    default:
      cor = '#3b82f6'; // Azul padrão
  }

  // ✅ CORREÇÃO: Observações apenas para lembretes do usuário
  const observacoes = evento.notes || '';

  // Verificar status para evitar problemas com restrição
  const statusBackend = mapearStatusParaBackend(evento.status);
  logger.info(`[converterParaSupabase] Status mapeado: ${evento.status} -> ${statusBackend}`);

  // Garantir que o telefone é tratado corretamente
  const telefone = evento.phone ? evento.phone.replace(/\D/g, '') : null;

  // Converter data de nascimento para formato DATE brasileiro (dd/mm/aaaa -> aaaa-mm-dd)
  const dataNascimento = evento.birthday ? 
    `${evento.birthday.getFullYear()}-${String(evento.birthday.getMonth() + 1).padStart(2, '0')}-${String(evento.birthday.getDate()).padStart(2, '0')}` : null;

  // Criar o objeto para o Supabase (sem incluir id gerado)
  const eventoSupabase = {
    titulo: evento.clientName,
    data_inicio: dataInicio.toISOString(),
    data_fim: dataFim.toISOString(),
    tipo: evento.eventType,
    local: evento.location,
    observacoes: observacoes,
    telefone: telefone,
    status: statusBackend,
    notificacao_enviada: evento.reminderSent || false,
    user_id: userId,
    cor: cor,
    cliente_id: null, // Relacionamento com cliente se houver
    criado_em: agora,
    atualizado_em: agora,
    data_nascimento: dataNascimento, // ✅ NOVO: Campo específico para data de nascimento
    descricao: null, // ✅ REMOVIDO: Não mais usar descrição para data de nascimento
    valor_total: evento.totalValue,
    valor_entrada: evento.downPayment,
    valor_restante: evento.remainingValue,
    cpf_cliente: evento.cpf_cliente || null,
    endereco_cliente: evento.endereco_cliente || null
  };

  logger.info(`[converterParaSupabase] Objeto convertido para Supabase:`, eventoSupabase);
  return eventoSupabase;
};

// Converter evento do Supabase para o formato do frontend
export const converterDoSupabase = (evento: EventoSupabase): Event => {
  // Usar valores financeiros dos campos específicos
  let totalValue = evento.valor_total || 0;
  let downPayment = evento.valor_entrada || 0;
  let remainingValue = evento.valor_restante || 0;
  let notes = evento.observacoes || '';

  // Fallback: se os novos campos estão vazios, tentar extrair das observações (para compatibilidade)
  if (totalValue === 0 && downPayment === 0 && remainingValue === 0 && evento.observacoes) {
    const valorTotalMatch = evento.observacoes.match(/Valor Total: R\$(\d+(\.\d+)?)/);
    const entradaMatch = evento.observacoes.match(/Entrada: R\$(\d+(\.\d+)?)/);
    const valorRestanteMatch = evento.observacoes.match(/Valor Restante: R\$(\d+(\.\d+)?)/);

    if (valorTotalMatch) totalValue = parseFloat(valorTotalMatch[1]);
    if (entradaMatch) downPayment = parseFloat(entradaMatch[1]);
    if (valorRestanteMatch) remainingValue = parseFloat(valorRestanteMatch[1]);

    // Remove as linhas de valores das observações para as notas
    notes = evento.observacoes
      .replace(/Valor Total: R\$\d+(\.\d+)?(\r?\n)?/, '')
      .replace(/Entrada: R\$\d+(\.\d+)?(\r?\n)?/, '')
      .replace(/Valor Restante: R\$\d+(\.\d+)?(\r?\n)?/, '')
      .trim();
  }
  
  // Garantir consistência: se totalValue está zerado mas há downPayment + remainingValue
  if (totalValue === 0 && (downPayment > 0 || remainingValue > 0)) {
    totalValue = downPayment + remainingValue;
  }

  // ✅ NOVO: Ler data de nascimento da coluna específica
  let birthday: Date | null = null;
  if (evento.data_nascimento) {
    // Corrigir problema de timezone: criar data local em vez de UTC
    const [ano, mes, dia] = evento.data_nascimento.split('-').map(Number);
    birthday = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
  } else if (evento.descricao && evento.descricao.includes('Aniversário:')) {
    // Fallback: manter compatibilidade com dados antigos na descrição
    const birthdayMatch = evento.descricao.match(/Aniversário: (\d{4}-\d{2}-\d{2})/);
    if (birthdayMatch) {
      const [ano, mes, dia] = birthdayMatch[1].split('-').map(Number);
      birthday = new Date(ano, mes - 1, dia);
    }
  }

  // Verificar se o evento é passado e ajustar status se necessário
  const dataEvento = new Date(evento.data_inicio);
  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const dataEventoSemHorario = new Date(dataEvento.getFullYear(), dataEvento.getMonth(), dataEvento.getDate());
  
  let statusFinal = evento.status || 'agendado';
  
  // Se o evento é de data passada e não está marcado como "cancelado", "concluido" ou "past"
  if (dataEventoSemHorario < hoje && 
      !['cancelado', 'concluido', 'past'].includes(statusFinal)) {
    statusFinal = 'past';
  }

  return {
    id: evento.id, // ID é obrigatório, sempre deve existir quando vem do banco
    clientName: evento.titulo,
    phone: evento.telefone || '',
    birthday,
    eventType: evento.tipo || '',
    date: dataEvento,
    time: dataEvento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    location: evento.local || '',
    totalValue,
    downPayment,
    remainingValue,
    notes,
    status: mapearStatusParaFrontend(statusFinal),
    reminderSent: evento.notificacao_enviada || false,
    cpf_cliente: evento.cpf_cliente || '',
    endereco_cliente: evento.endereco_cliente || ''
  } as Event;
};

// Buscar todos os eventos de um usuário
export const buscarEventos = async (userId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    logger.error('Erro ao buscar eventos:', error);
    throw error;
  }

  return (data || []).map(converterDoSupabase);
};

// DESABILITADO: Função de sincronização automática entre agenda e financeiro
// Os valores financeiros são salvos corretamente na tabela agenda_eventos
export const sincronizarEventoFinanceiro = async (eventoId: string, userId: string): Promise<void> => {
  logger.info(`[sincronizarEventoFinanceiro] FUNÇÃO DESABILITADA - Sincronização automática removida para evento ${eventoId}`);
  return; // Função desabilitada - não faz mais sincronização automática
  
  /*
  try {
    logger.info(`[sincronizarEventoFinanceiro] Iniciando sincronização para evento ${eventoId}`);
    
    // 1. Buscar evento completo
    const { data: evento, error: errorEvento } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('id', eventoId)
      .eq('user_id', userId)
      .single();
      
    if (errorEvento || !evento) {
      logger.error('[sincronizarEventoFinanceiro] Evento não encontrado:', errorEvento);
      throw new Error('Evento não encontrado para sincronização');
    }
    
    logger.info(`[sincronizarEventoFinanceiro] Evento encontrado: ${evento.titulo} (${evento.tipo})`);
    
    // 2. Converter para formato de frontend para extrair valores financeiros
    const eventoFormatado = converterDoSupabase(evento);
    
    logger.info(`[sincronizarEventoFinanceiro] Valores financeiros do evento: entrada=${eventoFormatado.downPayment}, restante=${eventoFormatado.remainingValue}, total=${eventoFormatado.totalValue}`);
    
    // 3. Buscar transações existentes para este evento
    const { data: transacoesExistentes, error: errorTransacoes } = await supabase
      .from('financeiro_transacoes')
      .select('*')
      .eq('evento_id', eventoId)
      .eq('user_id', userId);
      
    if (errorTransacoes) {
      logger.error('[sincronizarEventoFinanceiro] Erro ao buscar transações:', errorTransacoes);
      throw errorTransacoes;
    }
    
    logger.info(`[sincronizarEventoFinanceiro] ${transacoesExistentes?.length || 0} transações encontradas para o evento`);
    
    // 4. Verificar se existe transação de entrada
    const transacaoEntrada = transacoesExistentes?.find(t => t.tipo === 'receita' && t.status === 'entrada');
    
    // 5. Verificar se existe transação de valor restante (agora com status 'restante')
    const transacaoRestante = transacoesExistentes?.find(t => t.status === 'restante');
    
    // 6. Atualizar ou criar transação de entrada
    if (eventoFormatado.downPayment > 0) {
      if (transacaoEntrada) {
        // Atualizar transação de entrada existente
        logger.info(`[sincronizarEventoFinanceiro] Atualizando transação de entrada (ID: ${transacaoEntrada.id})`);
        
        const { error: errorUpdateEntrada } = await supabase
          .from('financeiro_transacoes')
          .update({
            valor: eventoFormatado.downPayment,
            descricao: `Entrada - ${eventoFormatado.eventType} (${eventoFormatado.clientName})`,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', transacaoEntrada.id);
        
        if (errorUpdateEntrada) {
          logger.error('[sincronizarEventoFinanceiro] Erro ao atualizar transação de entrada:', errorUpdateEntrada);
        }
      } else {
        // Criar nova transação de entrada
        logger.info('[sincronizarEventoFinanceiro] Criando nova transação de entrada');
        
        const novaTransacao = {
          id: uuidv4(),
          user_id: userId,
          evento_id: eventoId,
          descricao: `Entrada - ${eventoFormatado.eventType} (${eventoFormatado.clientName})`,
          valor: eventoFormatado.downPayment,
          tipo: 'receita',
          status: 'entrada',
          data_transacao: new Date().toISOString().split('T')[0], // Apenas a data
          observacoes: `Valor de entrada para evento do tipo "${eventoFormatado.eventType}" agendado para ${eventoFormatado.date.toLocaleDateString()}`,
          created_at: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        };
        
        const { error: errorInsertEntrada } = await supabase
          .from('financeiro_transacoes')
          .insert([novaTransacao]);
        
        if (errorInsertEntrada) {
          logger.error('[sincronizarEventoFinanceiro] Erro ao criar transação de entrada:', errorInsertEntrada);
        }
      }
    } else if (transacaoEntrada) {
      // Se o valor de entrada foi zerado, remover a transação de entrada
      logger.info(`[sincronizarEventoFinanceiro] Removendo transação de entrada ${transacaoEntrada.id} pois valor de entrada foi zerado`);
      
      const { error: errorDeleteEntrada } = await supabase
        .from('financeiro_transacoes')
        .delete()
        .eq('id', transacaoEntrada.id);
      
      if (errorDeleteEntrada) {
        logger.error('[sincronizarEventoFinanceiro] Erro ao remover transação de entrada:', errorDeleteEntrada);
      }
    }
    
    // 7. Atualizar ou criar transação de valor restante
    if (eventoFormatado.remainingValue > 0) {
      if (transacaoRestante) {
        // Atualizar transação de valor restante existente
        logger.info(`[sincronizarEventoFinanceiro] Atualizando transação de valor restante (ID: ${transacaoRestante.id})`);
        
        const { error: errorUpdateRestante } = await supabase
          .from('financeiro_transacoes')
          .update({
            valor: eventoFormatado.remainingValue,
            descricao: `Restante - ${eventoFormatado.eventType} (${eventoFormatado.clientName})`,
            data_transacao: eventoFormatado.date.toISOString().split('T')[0], // Data do evento
            atualizado_em: new Date().toISOString()
          })
          .eq('id', transacaoRestante.id);
        
        if (errorUpdateRestante) {
          logger.error('[sincronizarEventoFinanceiro] Erro ao atualizar transação de valor restante:', errorUpdateRestante);
        }
      } else {
        // Criar nova transação de valor restante
        logger.info('[sincronizarEventoFinanceiro] Criando nova transação de valor restante');
        
        const novaTransacaoRestante = {
          id: uuidv4(),
          user_id: userId,
          evento_id: eventoId,
          descricao: `Restante - ${eventoFormatado.eventType} (${eventoFormatado.clientName})`,
          valor: eventoFormatado.remainingValue,
          tipo: 'receita',
          status: 'restante',
          data_transacao: eventoFormatado.date.toISOString().split('T')[0], // Data do evento
          observacoes: `Valor restante para evento do tipo "${eventoFormatado.eventType}" agendado para ${eventoFormatado.date.toLocaleDateString()}`,
          created_at: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        };
        
        const { error: errorInsertRestante } = await supabase
          .from('financeiro_transacoes')
          .insert([novaTransacaoRestante]);
        
        if (errorInsertRestante) {
          logger.error('[sincronizarEventoFinanceiro] Erro ao criar nova transação de valor restante:', errorInsertRestante);
        }
      }
    } else if (transacaoRestante) {
      // Se o valor restante foi zerado, remover a transação de valor restante
      logger.info(`[sincronizarEventoFinanceiro] Removendo transação de valor restante ${transacaoRestante.id} pois valor restante foi zerado`);
      
      const { error: errorDeleteRestante } = await supabase
        .from('financeiro_transacoes')
        .delete()
        .eq('id', transacaoRestante.id);
      
      if (errorDeleteRestante) {
        logger.error('[sincronizarEventoFinanceiro] Erro ao remover transação de valor restante:', errorDeleteRestante);
      }
    }
    
    // 8. Notificar sobre a atualização financeira
    if (typeof atualizarContextoFinanceiro === 'function') {
      try {
        logger.info('[sincronizarEventoFinanceiro] Notificando atualização do contexto financeiro');
        atualizarContextoFinanceiro(userId);
      } catch (error) {
        logger.error('[sincronizarEventoFinanceiro] Erro ao executar callback de atualização financeira:', error);
        // Não propagar o erro para não interromper a operação principal
      }
    } else {
      logger.warn('[sincronizarEventoFinanceiro] Callback de atualização financeira não está registrado');
    }
    
    logger.info('[sincronizarEventoFinanceiro] Sincronização concluída com sucesso');
  } catch (error) {
    logger.error('[sincronizarEventoFinanceiro] Erro na sincronização:', error);
    throw error;
  }
  */
};

// Criar um novo evento
export const criarEvento = async (evento: Event, userId: string): Promise<Event> => {
  try {
    logger.info(`[criarEvento] Criando evento para ${evento.clientName} no dia ${evento.date.toLocaleDateString()}`);
    
    // Converter evento para formato do Supabase
    const eventoSupabase = converterParaSupabase(evento, userId);
    
    // Tentativa de criar o evento no banco de dados
    const { data, error } = await supabase
      .from('agenda_eventos')
      .insert([eventoSupabase as any]) // Cast para evitar problemas de tipo com campos novos
      .select()
      .single();
    
    if (error) {
      logger.error('[criarEvento] Erro ao criar evento:', error);
      throw error;
    }
    
    logger.info(`[criarEvento] Evento criado com sucesso, ID: ${data.id}`);
    
    // Sincronizar cliente automaticamente
    try {
      // Converter data de nascimento para string no formato correto se existir
      let dataNascimentoFormatada: string | null = null;
      if (evento.birthday) {
        dataNascimentoFormatada = `${evento.birthday.getFullYear()}-${String(evento.birthday.getMonth() + 1).padStart(2, '0')}-${String(evento.birthday.getDate()).padStart(2, '0')}`;
      }
      
      await clientService.syncCliente({
        nome: data.titulo,
        telefone: data.telefone,
        tipoEvento: data.tipo,
        valorServico: (data as any).valor_total || 0, // Cast para acessar campos financeiros
        dataEvento: data.data_inicio,
        dataNascimento: dataNascimentoFormatada,
        userId: userId
      });
      logger.info('[criarEvento] Sincronização de cliente realizada com sucesso');
    } catch (erroSincronizacaoCliente) {
      logger.warn('[criarEvento] Falha na sincronização do cliente:', erroSincronizacaoCliente);
      // Não interromper o fluxo por causa do erro de sincronização do cliente
    }
    
    // REMOVIDO: Sincronização automática financeira
    // Os valores financeiros já são salvos corretamente na tabela agenda_eventos
    logger.info('[criarEvento] Valores financeiros salvos na agenda_eventos - sem sincronização automática');
    
    // Invalidar cache automaticamente após criação do evento
    invalidateAfterCRUD('create', 'evento', userId);
    
    return converterDoSupabase(data);
  } catch (error) {
    logger.error('[criarEvento] Erro não tratado:', error);
    throw new Error(`Erro ao criar evento: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Atualizar um evento existente
export const atualizarEvento = async (eventoId: string, evento: Partial<Event>, userId: string): Promise<Event> => {
  try {
    logger.info(`[atualizarEvento] Atualizando evento ${eventoId}`, evento);
    
    // Primeiro, buscar o evento atual para comparar valores
    const { data: eventoAtual, error: errorBusca } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('id', eventoId)
      .eq('user_id', userId)
      .single();
    
    if (errorBusca) {
      logger.error('[atualizarEvento] Erro ao buscar evento para atualização:', errorBusca);
      throw errorBusca;
    }
    
    if (!eventoAtual) {
      logger.error('[atualizarEvento] Evento não encontrado para atualização');
      throw new Error('Evento não encontrado ou você não tem permissão para editá-lo.');
    }
    
    logger.info('[atualizarEvento] Evento atual encontrado:', eventoAtual.id);
    
    // Preparar campos para atualização
    const camposAtualizados: { [key: string]: any } = {};
    
    // Se algum dos campos obrigatórios foi fornecido, atualizar
    if (evento.clientName !== undefined) camposAtualizados.titulo = evento.clientName;
    if (evento.eventType !== undefined) camposAtualizados.tipo = evento.eventType;
    if (evento.location !== undefined) camposAtualizados.local = evento.location;
    if (evento.phone !== undefined) camposAtualizados.telefone = evento.phone;
    if (evento.cpf_cliente !== undefined) camposAtualizados.cpf_cliente = evento.cpf_cliente;
    if (evento.endereco_cliente !== undefined) camposAtualizados.endereco_cliente = evento.endereco_cliente;
    if (evento.status !== undefined) {
      // Mapear status para formato backend
      camposAtualizados.status = mapearStatusParaBackend(evento.status);
      
      // ATUALIZAR COR correspondente ao status (corrigindo inconsistência)
      let corCorrespondente: string;
      switch (evento.status) {
        case 'pending':
          corCorrespondente = '#3b82f6'; // Azul (Aguardando)
          break;
        case 'confirmed':
          corCorrespondente = '#10b981'; // Verde (Confirmados)
          break;
        case 'completed':
          corCorrespondente = '#8b5cf6'; // Roxo (Concluídos)
          break;
        case 'canceled':
          corCorrespondente = '#6b7280'; // Cinza (Cancelados)
          break;
        case 'upcoming':
          corCorrespondente = '#f59e0b'; // Âmbar (Próximos)
          break;
        case 'past':
          corCorrespondente = '#ef4444'; // Vermelho (Passados)
          break;
        default:
          corCorrespondente = '#3b82f6'; // Azul padrão
      }
      camposAtualizados.cor = corCorrespondente;
    }
    
    // Se a data foi alterada, precisamos atualizar tanto data_inicio quanto data_fim
    if (evento.date !== undefined) {
      const dataInicio = new Date(evento.date);
      const dataFim = new Date(dataInicio);
      dataFim.setHours(dataFim.getHours() + 1); // Adicionar 1 hora
      
      camposAtualizados.data_inicio = dataInicio.toISOString();
      camposAtualizados.data_fim = dataFim.toISOString();
    }
    
    // ✅ NOVO: Processar data de nascimento se fornecida
    if (evento.birthday !== undefined) {
      camposAtualizados.data_nascimento = evento.birthday ? 
        `${evento.birthday.getFullYear()}-${String(evento.birthday.getMonth() + 1).padStart(2, '0')}-${String(evento.birthday.getDate()).padStart(2, '0')}` : null;
    }
    
    // Atualizar timestamp
    camposAtualizados.atualizado_em = new Date().toISOString();
    
    // Se houver alteração nos valores financeiros, atualizar campos específicos e observações
    if (evento.totalValue !== undefined || 
        evento.downPayment !== undefined || 
        evento.remainingValue !== undefined || 
        evento.notes !== undefined) {
      
      // Reconstruir os valores atualizados
      const totalValue = evento.totalValue ?? converterDoSupabase(eventoAtual).totalValue;
      const downPayment = evento.downPayment ?? converterDoSupabase(eventoAtual).downPayment;
      const remainingValue = evento.remainingValue ?? converterDoSupabase(eventoAtual).remainingValue;
      const notes = evento.notes ?? converterDoSupabase(eventoAtual).notes;

      // Atualizar campos financeiros específicos
      camposAtualizados.valor_total = totalValue;
      camposAtualizados.valor_entrada = downPayment;
      camposAtualizados.valor_restante = remainingValue;

      // ✅ CORREÇÃO: Observações apenas para lembretes do usuário
      camposAtualizados.observacoes = notes || '';
    }
    
    // Realizar a atualização do evento
    const { data, error: errorUpdate } = await supabase
      .from('agenda_eventos')
      .update(camposAtualizados)
      .eq('id', eventoId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (errorUpdate) {
      logger.error('[atualizarEvento] Erro ao atualizar evento:', errorUpdate);
      throw errorUpdate;
    }
    
    logger.info('[atualizarEvento] Evento atualizado com sucesso:', data);
    
    // Sincronizar cliente automaticamente
    try {
      // Converter data de nascimento para string no formato correto se existir
      let dataNascimentoFormatada: string | null = null;
      if (evento.birthday) {
        // ✅ CORREÇÃO: Formatar data local sem conversão UTC para evitar problema de timezone
        dataNascimentoFormatada = `${evento.birthday.getFullYear()}-${String(evento.birthday.getMonth() + 1).padStart(2, '0')}-${String(evento.birthday.getDate()).padStart(2, '0')}`;
      }
      
      await clientService.syncCliente({
        nome: data.titulo,
        telefone: data.telefone,
        tipoEvento: data.tipo,
        valorServico: (data as any).valor_total || 0, // Cast para acessar campos financeiros
        dataEvento: data.data_inicio,
        dataNascimento: dataNascimentoFormatada,
        userId: userId
      });
      logger.info('[atualizarEvento] Sincronização de cliente realizada com sucesso');
    } catch (erroSincronizacaoCliente) {
      logger.warn('[atualizarEvento] Falha na sincronização do cliente:', erroSincronizacaoCliente);
      // Não interromper o fluxo por causa do erro de sincronização do cliente
    }
    
    // REMOVIDO: Sincronização automática financeira  
    // Os valores financeiros já são salvos corretamente na tabela agenda_eventos
    logger.info('[atualizarEvento] Valores financeiros salvos na agenda_eventos - sem sincronização automática');
    
    // Invalidar cache automaticamente após atualização do evento
    invalidateAfterCRUD('update', 'evento', userId);
    
    return converterDoSupabase(data);
  } catch (error) {
    logger.error('[atualizarEvento] Erro não tratado:', error);
    throw error;
  }
};

// Registrar ajuste de valor de entrada como transação financeira
const registrarAjusteEntrada = async (evento: Partial<Event>, userId: string, eventoId: string, valorAjuste: number) => {
  try {
    logger.info(`[registrarAjusteEntrada] Iniciando registro de ajuste de valor de entrada (R$${valorAjuste}) como transação financeira`);
    
    if (!valorAjuste || valorAjuste <= 0) {
      logger.info('[registrarAjusteEntrada] Valor de ajuste zerado ou negativo. Nenhuma transação será registrada.');
      return null;
    }
    
    // Primeiro, buscar o evento completo para garantir dados atualizados
    const { data: eventoAtual, error: errorBusca } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('id', eventoId)
      .eq('user_id', userId)
      .single();
      
    if (errorBusca) {
      logger.error('[registrarAjusteEntrada] Erro ao buscar evento para registro de ajuste:', errorBusca);
      throw new Error(`Não foi possível encontrar o evento para registro de ajuste: ${errorBusca.message}`);
    }
    
    // Converter para obter valores financeiros
    const eventoConvertido = converterDoSupabase(eventoAtual);
    
    // Reconstruir o campo observacoes com valores atualizados
    const totalValue = eventoConvertido.totalValue;
    const downPayment = eventoConvertido.downPayment + valorAjuste; // Ajuste do valor de entrada
    const remainingValue = totalValue - downPayment;
    
    // ✅ CORREÇÃO: Atualizar apenas os valores financeiros, preservar observações originais
    const { error: errorUpdate } = await supabase
      .from('agenda_eventos')
      .update({ 
        valor_entrada: downPayment,
        valor_restante: remainingValue,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', eventoId)
      .eq('user_id', userId);
      
    if (errorUpdate) {
      logger.error('[registrarAjusteEntrada] Erro ao atualizar observações do evento:', errorUpdate);
      // Continuar mesmo com erro para tentar criar a transação
    }
    
    // Criar objeto de transação financeira para o ajuste
    const transacao = {
      id: uuidv4(),
      descricao: `Ajuste de Entrada - ${evento.eventType || eventoConvertido.eventType} (${evento.clientName || eventoConvertido.clientName})`,
      clienteName: evento.clientName || eventoConvertido.clientName || '',
      valor: valorAjuste,
      tipo: 'receita' as const,
      status: 'entrada' as const, // Considerar o ajuste como entrada já recebida
      data_transacao: new Date().toISOString(), // Convertido para string
      data_evento: evento.date ? evento.date.toISOString() : eventoConvertido.date.toISOString(), // Convertido para string
      categoria: 'Entrada de Evento',
      forma_pagamento: '', // Poderia ser preenchido se fosse informado no formulário do evento
      observacoes: `Ajuste no valor de entrada para evento do tipo "${evento.eventType || eventoConvertido.eventType}" agendado para ${evento.date ? evento.date.toLocaleDateString() : eventoConvertido.date.toLocaleDateString()}. ID do evento: ${eventoId}`,
      user_id: userId,
      cliente_id: null // Poderia vincular a um cliente cadastrado no futuro
    };
    
    logger.info('[registrarAjusteEntrada] Objeto de transação de ajuste criado:', JSON.stringify(transacao));
    
    // Criar a transação no sistema financeiro
    try {
      // Inserir diretamente no banco para evitar dependência circular
      const { data: transacaoInserida, error: errorInsert } = await supabase
        .from('financeiro_transacoes')
        .insert([transacao])
        .select()
        .single();
        
      if (errorInsert) {
        logger.error('[registrarAjusteEntrada] Erro ao criar transação financeira de ajuste:', errorInsert);
        throw errorInsert;
      }
      
      logger.info('[registrarAjusteEntrada] Ajuste de valor de entrada registrado com sucesso como transação financeira:', transacaoInserida.id);
      return transacaoInserida;
    } catch (erroTransacao) {
      logger.error('[registrarAjusteEntrada] Erro ao criar transação financeira de ajuste:', erroTransacao);
      throw erroTransacao; // Propagar o erro para poder ser tratado no fluxo principal
    }
  } catch (error) {
    logger.error('[registrarAjusteEntrada] Erro ao registrar ajuste de valor de entrada como transação:', error);
    // Lançamos o erro para que seja tratado adequadamente no fluxo principal
    throw new Error(`Falha ao registrar ajuste de entrada como transação: ${error.message}`);
  }
};

// Excluir um evento
export const excluirEvento = async (eventoId: string, userId: string): Promise<void> => {
  try {
    logger.info(`[excluirEvento] Iniciando exclusão do evento ${eventoId}`);
    
    // Primeiro, verificar se o evento existe
    const { data: eventoExistente, error: errorBusca } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, observacoes, data_inicio')
      .eq('id', eventoId)
      .eq('user_id', userId)
      .single();
    
    if (errorBusca) {
      if (errorBusca.code === 'PGRST116') {
        throw new Error('Evento não encontrado ou você não tem permissão para excluí-lo.');
      }
      throw new Error(`Erro ao buscar evento: ${errorBusca.message}`);
    }
    
    logger.info(`[excluirEvento] Evento encontrado: ${eventoExistente.titulo}`);
    
    // Remover transações financeiras relacionadas ao evento (se existirem)
    try {
      const { error: errorTransacoes } = await (supabase as any)
        .from('financeiro_transacoes')
        .delete()
        .eq('user_id', userId)
        .eq('evento_id', eventoId);
      
      if (errorTransacoes) {
        logger.warn(`[excluirEvento] Aviso: Erro ao remover transações relacionadas: ${errorTransacoes.message}`);
      } else {
        logger.info(`[excluirEvento] Transações relacionadas removidas`);
      }
    } catch (transacaoError) {
      logger.warn(`[excluirEvento] Aviso: Falha ao remover transações relacionadas:`, transacaoError);
      // Não interromper o processo de exclusão do evento por causa de falha nas transações
    }
    
    // Excluir o evento
    const { error: errorExclusao } = await supabase
      .from('agenda_eventos')
      .delete()
      .eq('id', eventoId)
      .eq('user_id', userId);

    if (errorExclusao) {
      logger.error(`[excluirEvento] Erro ao excluir evento do banco:`, errorExclusao);
      throw new Error(`Erro ao excluir evento: ${errorExclusao.message}`);
    }
    
    logger.info(`[excluirEvento] Evento ${eventoId} excluído com sucesso`);
    
    // Sincronizar exclusão de cliente automaticamente
    try {
      await clientService.deleteSyncCliente({
        nome: eventoExistente.titulo,
        dataEvento: eventoExistente.data_inicio,
        userId: userId
      });
      logger.info('[excluirEvento] Cliente sincronizado (excluído) com sucesso');
    } catch (syncError) {
      logger.warn('[excluirEvento] Falha na sincronização de exclusão do cliente:', syncError);
      // Não interromper o fluxo se a sincronização falhar
    }
    
    // Invalidar cache automaticamente após exclusão do evento
    invalidateAfterCRUD('delete', 'evento', userId);
    
    // Notificar sobre a atualização financeira, se o callback estiver registrado
    if (typeof atualizarContextoFinanceiro === 'function') {
      try {
        logger.info('[excluirEvento] Notificando atualização do contexto financeiro');
        atualizarContextoFinanceiro(userId);
      } catch (error) {
        logger.error('[excluirEvento] Erro ao executar callback de atualização financeira:', error);
        // Não propagar o erro para não interromper a operação principal
      }
    } else {
      logger.warn('[excluirEvento] Callback de atualização financeira não está registrado');
    }
  } catch (error) {
    logger.error(`[excluirEvento] Erro geral na exclusão:`, error);
    throw error;
  }
};

// Sincronizar todos os eventos de um usuário com o financeiro
export const sincronizarTodosEventosFinanceiro = async (userId: string): Promise<{
  total: number;
  sucessos: number;
  falhas: number;
  detalhes: Array<{eventoId: string; sucesso: boolean; erro?: string}>;
}> => {
  logger.info(`[sincronizarTodosEventosFinanceiro] Iniciando sincronização de todos os eventos para usuário ${userId}`);
  
  try {
    // Buscar todos os eventos do usuário
    const { data: eventos, error: errorBusca } = await supabase
      .from('agenda_eventos')
      .select('id, titulo')
      .eq('user_id', userId)
      .not('status', 'eq', 'cancelado');
      
    if (errorBusca) {
      logger.error('[sincronizarTodosEventosFinanceiro] Erro ao buscar eventos:', errorBusca);
      throw errorBusca;
    }
    
    if (!eventos || eventos.length === 0) {
      logger.info('[sincronizarTodosEventosFinanceiro] Nenhum evento encontrado para sincronização');
      return { total: 0, sucessos: 0, falhas: 0, detalhes: [] };
    }
    
    logger.info(`[sincronizarTodosEventosFinanceiro] ${eventos.length} eventos encontrados para sincronização`);
    
    // Estatísticas
    const resultado = {
      total: eventos.length,
      sucessos: 0,
      falhas: 0,
      detalhes: [] as Array<{eventoId: string; sucesso: boolean; erro?: string}>
    };
    
    // Sincronizar cada evento
    for (const evento of eventos) {
      try {
        logger.info(`[sincronizarTodosEventosFinanceiro] Sincronizando evento ${evento.id} (${evento.titulo})`);
        await sincronizarEventoFinanceiro(evento.id, userId);
        resultado.sucessos++;
        resultado.detalhes.push({ eventoId: evento.id, sucesso: true });
        logger.info(`[sincronizarTodosEventosFinanceiro] Evento ${evento.id} sincronizado com sucesso`);
      } catch (error) {
        resultado.falhas++;
        resultado.detalhes.push({ 
          eventoId: evento.id, 
          sucesso: false, 
          erro: error instanceof Error ? error.message : String(error)
        });
        logger.error(`[sincronizarTodosEventosFinanceiro] Erro ao sincronizar evento ${evento.id}:`, error);
        // Continuar para o próximo evento mesmo se este falhar
      }
    }
    
    logger.info(`[sincronizarTodosEventosFinanceiro] Sincronização concluída. Resultados: total=${resultado.total}, sucessos=${resultado.sucessos}, falhas=${resultado.falhas}`);
    
    // Notificar sobre a atualização financeira, se o callback estiver registrado
    if (typeof atualizarContextoFinanceiro === 'function') {
      try {
        logger.info('[sincronizarTodosEventosFinanceiro] Notificando atualização do contexto financeiro');
        atualizarContextoFinanceiro(userId);
      } catch (error) {
        logger.error('[sincronizarTodosEventosFinanceiro] Erro ao executar callback de atualização financeira:', error);
        // Não propagar o erro para não interromper a operação principal
      }
    } else {
      logger.warn('[sincronizarTodosEventosFinanceiro] Callback de atualização financeira não está registrado');
    }
    
    return resultado;
  } catch (error) {
    logger.error('[sincronizarTodosEventosFinanceiro] Erro geral na sincronização:', error);
    throw error;
  }
};

// Interface para eventos formatados como transações
interface EventoFormatadoComoTransacao {
  id: string;
  descricao: string;
  clienteName: string;
  valor: number;
  tipo: 'receita';
  status: 'restante' | 'entrada';
  data_transacao: string;
  data_evento: string;
  categoria: string;
  forma_pagamento: string;
  observacoes: string;
  user_id: string;
  cliente_id?: string;
  evento_id: string;
}

// Buscar eventos com valores restantes
// Função interna sem cache para buscarEventosComValoresRestantes
const _buscarEventosComValoresRestantesInternal = async (userId: string): Promise<EventoFormatadoComoTransacao[]> => {
  logger.info(`[buscarEventosComValoresRestantes] Buscando eventos com valores restantes para usuário ${userId}`);
  
  const query = supabase
    .from('agenda_eventos')
    .select('*')
    .eq('user_id', userId)
    .gt('valor_restante', 0)
    .not('status', 'eq', 'cancelado');
  
  const { data, error } = await query.order('data_inicio', { ascending: true });
  
  if (error) {
    logger.error('[buscarEventosComValoresRestantes] Erro ao buscar eventos:', error);
    throw error;
  }
  
  // Converter para formato adequado para exibição
  const eventosFormatados = (data || []).map(evento => ({
    id: evento.id,
    descricao: `${evento.titulo} - Valor Restante`,
    clienteName: evento.titulo,
    valor: (evento as any).valor_restante || 0, // Cast para acessar campo financeiro
    tipo: 'receita',
    status: 'restante',
    data_transacao: evento.data_inicio,
    data_evento: evento.data_inicio,
    categoria: 'Valor Restante',
    forma_pagamento: '',
    observacoes: `Valor restante do evento ${evento.titulo}`,
    user_id: userId,
    cliente_id: evento.cliente_id,
    evento_id: evento.id
  }));
  
  logger.info(`[buscarEventosComValoresRestantes] ${eventosFormatados.length} eventos com valores restantes encontrados`);
  return eventosFormatados;
};

// Função pública com cache e debounce
export const buscarEventosComValoresRestantes = async (userId: string): Promise<EventoFormatadoComoTransacao[]> => {
  try {
    const cacheKey = `eventos_valores_restantes_${userId}`;
    return await requestOptimizer.getOrExecute(
      cacheKey,
      () => _buscarEventosComValoresRestantesInternal(userId)
    );
  } catch (error) {
    logger.error('[buscarEventosComValoresRestantes] Erro:', error);
    throw error;
  }
};

// Função interna sem cache para buscarEventosComValoresEntradas
const _buscarEventosComValoresEntradasInternal = async (userId: string): Promise<EventoFormatadoComoTransacao[]> => {
  logger.info(`[buscarEventosComValoresEntradas] Buscando eventos com valores de entrada para usuário ${userId}`);
  
  const query = supabase
    .from('agenda_eventos')
    .select('*')
    .eq('user_id', userId)
    .gt('valor_entrada', 0)
    .not('status', 'eq', 'cancelado');
  
  const { data, error } = await query.order('data_inicio', { ascending: true });
  
  if (error) {
    logger.error('[buscarEventosComValoresEntradas] Erro ao buscar eventos:', error);
    throw error;
  }
  
  // Converter para formato adequado para exibição
  const eventosFormatados = (data || []).map(evento => ({
    id: evento.id,
    descricao: `${evento.titulo} - Valor de Entrada`,
    clienteName: evento.titulo,
    valor: (evento as any).valor_entrada || 0, // Cast para acessar campo financeiro
    tipo: 'receita',
    status: 'entrada',
    data_transacao: evento.criado_em,
    data_evento: evento.data_inicio,
    categoria: 'Valor de Entrada',
    forma_pagamento: '',
    observacoes: `Valor de entrada do evento ${evento.titulo}`,
    user_id: userId,
    cliente_id: evento.cliente_id,
    evento_id: evento.id
  }));
  
  logger.info(`[buscarEventosComValoresEntradas] ${eventosFormatados.length} eventos com valores de entrada encontrados`);
  return eventosFormatados;
};

// Função pública com cache e debounce
export const buscarEventosComValoresEntradas = async (userId: string): Promise<EventoFormatadoComoTransacao[]> => {
  try {
    const cacheKey = `eventos_valores_entradas_${userId}`;
    return await requestOptimizer.getOrExecute(
      cacheKey,
      () => _buscarEventosComValoresEntradasInternal(userId)
    );
  } catch (error) {
    logger.error('[buscarEventosComValoresEntradas] Erro:', error);
    throw error;
  }
};

// Buscar contagem de próximos eventos
export const buscarContagemProximosEventos = async (userId: string): Promise<number> => {
  try {
    logger.info(`[buscarContagemProximosEventos] Buscando contagem de próximos eventos para usuário ${userId}`);
    
    // Próximas 2 semanas
    const agora = new Date();
    const duasSemanasDepois = new Date();
    duasSemanasDepois.setDate(agora.getDate() + 14);
    
    const { count, error } = await supabase
      .from('agenda_eventos')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('data_inicio', agora.toISOString())
      .lte('data_inicio', duasSemanasDepois.toISOString())
      .not('status', 'eq', 'cancelado');
    
    if (error) {
      logger.error('[buscarContagemProximosEventos] Erro ao buscar contagem:', error);
      throw error;
    }
    
    logger.info(`[buscarContagemProximosEventos] ${count || 0} eventos encontrados`);
    return count || 0;
  } catch (error) {
    logger.error('[buscarContagemProximosEventos] Erro:', error);
    return 0;
  }
};

// Buscar eventos dos próximos 10 dias para o cliente
export const buscarEventosProximos10Dias = async (userId: string): Promise<Event[]> => {
  try {
    logger.info(`[buscarEventosProximos10Dias] Buscando eventos dos próximos 10 dias para usuário ${userId}`);
    
    // Próximos 10 dias
    const agora = new Date();
    const dezDiasDepois = new Date();
    dezDiasDepois.setDate(agora.getDate() + 10);
    
    const { data, error } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('user_id', userId)
      .gte('data_inicio', agora.toISOString())
      .lte('data_inicio', dezDiasDepois.toISOString())
      .not('status', 'eq', 'cancelado')
      .order('data_inicio', { ascending: true });
    
    if (error) {
      logger.error('[buscarEventosProximos10Dias] Erro ao buscar eventos:', error);
      throw error;
    }
    
    const eventos = (data || []).map(converterDoSupabase);
    logger.info(`[buscarEventosProximos10Dias] ${eventos.length} eventos encontrados`);
    return eventos;
  } catch (error) {
    logger.error('[buscarEventosProximos10Dias] Erro:', error);
    return [];
  }
};

// Buscar pagamentos do mês atual (usando mesma lógica do financeiro)
export const buscarPagamentosMesAtual = async (userId: string): Promise<number> => {
  try {
    logger.info(`[buscarPagamentosMesAtual] Buscando pagamentos do mês atual para usuário ${userId}`);
    
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);
    
    // 1. Buscar transações com tipo='receita' e status='entrada' do mês atual
    const { data: transacoesEntrada, error: errorTransacoes } = await supabase
      .from('financeiro_transacoes')
      .select('valor')
      .eq('user_id', userId)
      .eq('tipo', 'receita')
      .eq('status', 'entrada')
      .gte('data_transacao', inicioMes.toISOString())
      .lte('data_transacao', fimMes.toISOString());
    
    if (errorTransacoes) {
      logger.error('[buscarPagamentosMesAtual] Erro ao buscar transações de entrada:', errorTransacoes);
      throw errorTransacoes;
    }
    
    const totalTransacoesEntrada = (transacoesEntrada || []).reduce((sum, transacao) => sum + transacao.valor, 0);
    
    // 2. Buscar valores de entrada da agenda (usando função existente para compatibilidade)
    try {
      const eventosEntradas = await buscarEventosComValoresEntradas(userId);
      
      // Filtrar eventos criados no mês atual
      const eventosEntradaMesAtual = eventosEntradas.filter(evento => {
        const dataTransacao = new Date(evento.data_transacao);
        return dataTransacao >= inicioMes && dataTransacao <= fimMes;
      });
      
      const totalEventosEntrada = eventosEntradaMesAtual.reduce((sum, evento) => sum + evento.valor, 0);
      
      // 3. Somar os dois valores (mesma lógica do financeiro)
      const total = totalTransacoesEntrada + totalEventosEntrada;
      logger.info(`[buscarPagamentosMesAtual] Total de pagamentos: R$ ${total} (transações: R$ ${totalTransacoesEntrada} + eventos: R$ ${totalEventosEntrada})`);
    return total;
    } catch (eventosError) {
      logger.warn('[buscarPagamentosMesAtual] Erro ao buscar eventos de entrada, usando apenas transações:', eventosError);
      logger.info(`[buscarPagamentosMesAtual] Total de pagamentos (apenas transações): R$ ${totalTransacoesEntrada}`);
      return totalTransacoesEntrada;
    }
  } catch (error) {
    logger.error('[buscarPagamentosMesAtual] Erro:', error);
    return 0;
  }
};

// Buscar faturamento do mês atual
export const buscarFaturamentoMesAtual = async (userId: string): Promise<number> => {
  try {
    logger.info(`[buscarFaturamentoMesAtual] Buscando faturamento do mês atual para usuário ${userId}`);
    
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);
    
    const { data, error } = await supabase
      .from('financeiro_transacoes')
      .select('valor')
      .eq('user_id', userId)
      .eq('tipo', 'receita')
      .in('status', ['recebido', 'entrada'])
      .gte('data_transacao', inicioMes.toISOString())
      .lte('data_transacao', fimMes.toISOString());
    
    if (error) {
      logger.error('[buscarFaturamentoMesAtual] Erro ao buscar faturamento:', error);
      throw error;
    }
    
    const total = (data || []).reduce((sum, transacao) => sum + transacao.valor, 0);
    logger.info(`[buscarFaturamentoMesAtual] Total de faturamento: R$ ${total}`);
    return total;
  } catch (error) {
    logger.error('[buscarFaturamentoMesAtual] Erro:', error);
    return 0;
  }
};

// Registrar callback de atualização financeira
export const registrarCallbackAtualizacaoFinanceiro = (callback: (userId: string) => void): void => {
  logger.info('[registrarCallbackAtualizacaoFinanceiro] Registrando callback de atualização');
  atualizarContextoFinanceiro = callback;
};

// Buscar datas que possuem eventos para calendário
export const buscarDatasComEventos = async (userId: string, mes?: number, ano?: number): Promise<EventoCalendario[]> => {
  try {
    logger.info(`[buscarDatasComEventos] Buscando eventos para calendário - usuário: ${userId}, mês: ${mes}, ano: ${ano}`);
    
    let query = supabase
      .from('agenda_eventos')
      .select('id, titulo, data_inicio, data_fim, status, cor')
      .eq('user_id', userId)
      .not('status', 'eq', 'cancelado')
      .order('data_inicio', { ascending: true });
    
    // Se mês e ano fornecidos, aplicar filtro por período
    if (mes !== undefined && ano !== undefined) {
      const inicioMes = new Date(ano, mes, 1);
      const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59);
      query = query.gte('data_inicio', inicioMes.toISOString())
                   .lte('data_inicio', fimMes.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('[buscarDatasComEventos] Erro ao buscar eventos para calendário:', error);
      throw error;
    }
    
    // Obter data atual sem horário para comparação
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    
    // Converter para formato do calendário
    const eventosCalendario = (data || []).map(evento => {
      const dataEvento = new Date(evento.data_inicio);
      const dataEventoSemHorario = new Date(dataEvento.getFullYear(), dataEvento.getMonth(), dataEvento.getDate());
      
      let statusAtualizado = evento.status;
      
      // Se o evento é de data passada e não está marcado como "cancelado", "concluido" ou "past"
      if (dataEventoSemHorario < hoje && 
          !['cancelado', 'concluido', 'past'].includes(statusAtualizado)) {
        statusAtualizado = 'past';
      }
      
      // SEMPRE definir a cor baseada no status atual (ignorar cor salva no banco)
      let corAtualizada: string;
      switch (statusAtualizado) {
        case 'agendado':
        case 'pending':
          corAtualizada = '#3b82f6'; // azul
          break;
        case 'confirmado':
        case 'confirmed':
          corAtualizada = '#10b981'; // verde
          break;
        case 'concluido':
        case 'completed':
          corAtualizada = '#8b5cf6'; // roxo
          break;
        case 'cancelado':
        case 'canceled':
          corAtualizada = '#6b7280'; // cinza
          break;
        case 'proximo':
        case 'upcoming':
          corAtualizada = '#f59e0b'; // âmbar
          break;
        case 'past':
          corAtualizada = '#ef4444'; // vermelho
          break;
        default:
          corAtualizada = '#3b82f6'; // azul padrão
      }
      
      return {
        id: evento.id,
        titulo: evento.titulo,
        data_inicio: dataEvento,
        data_fim: new Date(evento.data_fim),
        status: statusAtualizado,
        cor: corAtualizada
      };
    });
    
    logger.info(`[buscarDatasComEventos] ${eventosCalendario.length} eventos encontrados para o calendário`);
    return eventosCalendario;
  } catch (error) {
    logger.error('[buscarDatasComEventos] Erro:', error);
    return [];
  }
};

// Buscar total de eventos criados
export const buscarTotalEventosCriados = async (userId: string): Promise<number> => {
  try {
    logger.info(`[buscarTotalEventosCriados] Buscando total de eventos criados para usuário ${userId}`);
    
    const { count, error } = await supabase
      .from('agenda_eventos')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (error) {
      logger.error('[buscarTotalEventosCriados] Erro ao buscar total de eventos:', error);
      throw error;
    }
    
    logger.info(`[buscarTotalEventosCriados] ${count || 0} eventos criados encontrados`);
    return count || 0;
  } catch (error) {
    logger.error('[buscarTotalEventosCriados] Erro:', error);
    return 0;
  }
};

// Buscar total de clientes
export const buscarTotalClientes = async (userId: string): Promise<number> => {
  try {
    logger.info(`[buscarTotalClientes] Buscando total de clientes para usuário ${userId}`);
    
    const { count, error } = await supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (error) {
      logger.error('[buscarTotalClientes] Erro ao buscar total de clientes:', error);
      throw error;
    }
    
    logger.info(`[buscarTotalClientes] ${count || 0} clientes encontrados`);
    return count || 0;
  } catch (error) {
    logger.error('[buscarTotalClientes] Erro:', error);
    return 0;
  }
};

// Buscar receita total do ano atual
export const buscarReceitaTotalAnoAtual = async (userId: string): Promise<number> => {
  try {
    logger.info(`[buscarReceitaTotalAnoAtual] Buscando receita total do ano atual para usuário ${userId}`);
    
    const anoAtual = new Date().getFullYear();
    const inicioAno = new Date(anoAtual, 0, 1);
    const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59, 999);
    
    // ✅ IMPLEMENTAÇÃO: Buscar valores de "Entradas" e "A Receber" da rota /financeiro 
    // e somar para o card "Receita Total" filtrado pelo ano atual
    
    // ⚡ CARD "ENTRADAS" da rota /financeiro - FILTRADO PELO ANO ATUAL
    // 1. Buscar transações com tipo='receita' e status='entrada' do ano atual
    const { buscarTransacoes } = await import('./financeiroService');
    const todasTransacoes = await buscarTransacoes(userId, {
      dataInicio: inicioAno,
      dataFim: fimAno
    });
    const transacoesEntrada = todasTransacoes.filter(t => t.tipo === 'receita' && t.status === 'entrada');
    const totalTransacoesEntrada = transacoesEntrada.reduce((sum, t) => sum + t.valor, 0);
    
    // 2. Buscar valores de entrada da agenda do ano atual
    const eventosEntradas = await buscarEventosComValoresEntradas(userId);
    const eventosEntradasAnoAtual = eventosEntradas.filter(evento => {
      const dataEvento = new Date(evento.data_transacao);
      return dataEvento >= inicioAno && dataEvento <= fimAno;
    });
    const totalEventosEntradas = eventosEntradasAnoAtual.reduce((sum, e) => sum + e.valor, 0);
    
    const totalEntradas = totalTransacoesEntrada + totalEventosEntradas;
    
    // ⚡ CARD "A RECEBER" da rota /financeiro - FILTRADO PELO ANO ATUAL  
    // 1. Buscar transações com tipo='receita' e status='restante' do ano atual
    const transacoesRestantes = todasTransacoes.filter(t => t.tipo === 'receita' && t.status === 'restante');
    const totalTransacoesRestantes = transacoesRestantes.reduce((sum, t) => sum + t.valor, 0);
    
    // 2. Buscar valores restantes da agenda do ano atual
    const eventosRestantes = await buscarEventosComValoresRestantes(userId);
    const eventosRestantesAnoAtual = eventosRestantes.filter(evento => {
      const dataEvento = new Date(evento.data_transacao);
      return dataEvento >= inicioAno && dataEvento <= fimAno;
    });
    const totalEventosRestantes = eventosRestantesAnoAtual.reduce((sum, e) => sum + e.valor, 0);
    
    const totalAReceber = totalTransacoesRestantes + totalEventosRestantes;
    
    // ✅ SOMA FINAL: Entradas + A Receber = Receita Total do ano atual
    const receitaTotalAnoAtual = totalEntradas + totalAReceber;
    
    logger.info(`[buscarReceitaTotalAnoAtual] Total de receita do ano ${anoAtual}: R$ ${receitaTotalAnoAtual}`);
    return receitaTotalAnoAtual;
  } catch (error) {
    logger.error('[buscarReceitaTotalAnoAtual] Erro:', error);
    return 0;
  }
};

// Registrar pagamento parcial e atualizar valor restante
export const registrarPagamentoParcial = async (eventoId: string, valorPagamento: number, userId: string): Promise<Event> => {
  try {
    logger.info(`[registrarPagamentoParcial] Registrando pagamento de R$ ${valorPagamento} para evento ${eventoId}`);
    
    // Primeiro, buscar o evento atual
    const { data: eventoAtual, error: errorBusca } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('id', eventoId)
      .eq('user_id', userId)
      .single();
    
    if (errorBusca) {
      logger.error('[registrarPagamentoParcial] Erro ao buscar evento:', errorBusca);
      throw errorBusca;
    }
    
    if (!eventoAtual) {
      logger.error('[registrarPagamentoParcial] Evento não encontrado');
      throw new Error('Evento não encontrado ou você não tem permissão para editá-lo.');
    }
    
    // Converter para obter valores atuais
    const eventoConvertido = converterDoSupabase(eventoAtual);
    
    // Validar se o valor do pagamento é válido
    if (valorPagamento <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero.');
    }
    
    if (valorPagamento > eventoConvertido.remainingValue) {
      throw new Error(`O valor do pagamento (R$ ${valorPagamento.toFixed(2)}) não pode ser maior que o valor restante (R$ ${eventoConvertido.remainingValue.toFixed(2)}).`);
    }
    
    // Calcular novo valor restante
    const novoValorRestante = eventoConvertido.remainingValue - valorPagamento;
    
    // Gerar observação com data e hora no formato brasileiro
    const agora = new Date();
    const dataHoraBrasil = agora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
    
    const observacaoPagamento = `Pagamento de R$ ${valorPagamento.toFixed(2).replace('.', ',')} em ${dataHoraBrasil}`;
    
    // Adicionar nova observação às observações existentes
    const observacoesAtualizadas = eventoConvertido.notes 
      ? `${eventoConvertido.notes}\n${observacaoPagamento}`
      : observacaoPagamento;
    
    // Preparar campos para atualização
    const camposAtualizados = {
      valor_restante: novoValorRestante,
      observacoes: observacoesAtualizadas,
      atualizado_em: agora.toISOString()
    };
    
    logger.info(`[registrarPagamentoParcial] Atualizando evento - Novo valor restante: R$ ${novoValorRestante.toFixed(2)}`);
    
    // Atualizar o evento no banco
    const { data, error: errorUpdate } = await supabase
      .from('agenda_eventos')
      .update(camposAtualizados)
      .eq('id', eventoId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (errorUpdate) {
      logger.error('[registrarPagamentoParcial] Erro ao atualizar evento:', errorUpdate);
      throw errorUpdate;
    }
    
    logger.info('[registrarPagamentoParcial] Pagamento registrado com sucesso');
    
    // Invalidar cache após atualização
    invalidateAfterCRUD('update', 'evento', userId);
    
    return converterDoSupabase(data);
  } catch (error) {
    logger.error('[registrarPagamentoParcial] Erro:', error);
    throw error;
  }
};

// Gerar recibo profissional para um evento
export const gerarReciboEvento = async (eventoId: string, userId: string): Promise<{
  recibo: Blob;
  evento: Event;
  telefoneCliente?: string;
}> => {
  try {
    logger.info(`[gerarReciboEvento] Gerando recibo para evento ${eventoId}`);
    
    // Buscar o evento atual
    const { data: eventoAtual, error: errorBusca } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('id', eventoId)
      .eq('user_id', userId)
      .single();
    
    if (errorBusca) {
      logger.error('[gerarReciboEvento] Erro ao buscar evento:', errorBusca);
      throw errorBusca;
    }
    
    if (!eventoAtual) {
      logger.error('[gerarReciboEvento] Evento não encontrado');
      throw new Error('Evento não encontrado ou você não tem permissão para acessá-lo.');
    }
    
    // Converter para formato frontend
    const eventoConvertido = converterDoSupabase(eventoAtual);
    
    // Buscar configurações da empresa do usuário
    let infoEmpresa = {
      nome: "Sua Empresa",
      telefone: "(00) 00000-0000",
      email: "contato@empresa.com",
      website: "www.empresa.com",
      logo: null as string | null,
      endereco: null as string | null,
      cidade: null as string | null,
      estado: null as string | null,
      cep: null as string | null,
      instagram: null as string | null,
      facebook: null as string | null,
      whatsapp: null as string | null,
      cnpj: null as string | null
    };
    
    try {
      logger.info('[gerarReciboEvento] Buscando dados da empresa do usuário...');
      
      // Buscar configurações da empresa do usuário
      const { data: configEmpresa, error: errorEmpresa } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!errorEmpresa && configEmpresa) {
        logger.info('[gerarReciboEvento] Dados da empresa encontrados, aplicando ao recibo');
        
        // Aplicar dados reais da empresa
        infoEmpresa = {
          nome: configEmpresa.nome_empresa || "Sua Empresa",
          telefone: configEmpresa.telefone || "(00) 00000-0000",
          email: configEmpresa.email_empresa || "contato@empresa.com",
          website: configEmpresa.site || "www.empresa.com",
          logo: configEmpresa.logo_url || null,
          endereco: configEmpresa.endereco || null,
          cidade: configEmpresa.cidade || null,
          estado: configEmpresa.estado || null,
          cep: configEmpresa.cep || null,
          instagram: configEmpresa.instagram || null,
          facebook: configEmpresa.facebook || null,
          whatsapp: configEmpresa.whatsapp || null,
          cnpj: configEmpresa.cnpj || null
        };
      } else {
        logger.warn('[gerarReciboEvento] Configurações da empresa não encontradas, usando dados padrão');
      }
    } catch (error) {
      logger.warn('[gerarReciboEvento] Erro ao buscar configurações da empresa, usando dados padrão:', error);
    }
    
    // Importar dinamicamente as funções de geração de recibo
    const { generateAndPrintReceipt, downloadReceiptHTML, generateReceiptHTML } = await import('@/utils/receiptGeneratorNative');
    
    // Carregar configurações visuais personalizadas do editor de recibos
    let configuracoesVisuais = null;
    try {
      const configSalva = localStorage.getItem('bright-spark-receipt-config');
      if (configSalva) {
        const config = JSON.parse(configSalva);
        configuracoesVisuais = config;
        logger.info('[gerarReciboEvento] Configurações visuais personalizadas carregadas');
      }
    } catch (error) {
      logger.warn('[gerarReciboEvento] Erro ao carregar configurações visuais, usando padrão:', error);
    }
    
    // Preparar dados do recibo
    const dadosRecibo = {
      eventoId: eventoConvertido.id,
      clienteNome: eventoConvertido.clientName,
      clienteTelefone: eventoConvertido.phone,
      eventoTipo: eventoConvertido.eventType,
      data: eventoConvertido.date.toISOString(),
      horario: eventoConvertido.time,
      valor: eventoConvertido.totalValue,
      valorPago: eventoConvertido.downPayment + (eventoConvertido.totalValue - eventoConvertido.remainingValue - eventoConvertido.downPayment),
      valorRestante: eventoConvertido.remainingValue,
      observacoes: eventoConvertido.notes,
      enderecoEvento: eventoConvertido.location
    };
    
    logger.info('[gerarReciboEvento] Gerando recibo profissional personalizado...');
    
    // Se há configurações personalizadas, aplicá-las
    if (configuracoesVisuais) {
      logger.info('[gerarReciboEvento] Aplicando configurações visuais personalizadas...');
      
      // Preparar informações da empresa com base na configuração personalizada
      const getCompanyField = (id: string, fallback: string = '') => {
        const item = configuracoesVisuais.companyConfig.items.find(item => item.id === id);
        if (!item || !item.visible) return '';
        
        // Priorizar dados reais da empresa sobre valores configurados
        let value = item.value;
        switch (id) {
          case 'nome':
            value = infoEmpresa.nome || value;
            break;
          case 'telefone':
            value = infoEmpresa.telefone || value;
            break;
          case 'email':
            value = infoEmpresa.email || value;
            break;
          case 'website':
            value = infoEmpresa.website || value;
            break;
          case 'whatsapp':
            value = infoEmpresa.whatsapp || value;
            break;
          case 'instagram':
            value = infoEmpresa.instagram || value;
            break;
          case 'facebook':
            value = infoEmpresa.facebook || value;
            break;
          case 'endereco':
            value = infoEmpresa.endereco || value;
            break;
          case 'cnpj':
            value = infoEmpresa.cnpj || value;
            break;
        }
        
        return value || fallback;
      };

      // Ordenar itens por ordem configurada
      const sortedItems = configuracoesVisuais.companyConfig.items
        .filter(item => item.visible)
        .sort((a, b) => a.order - b.order);

      // Construir informações da empresa seguindo a ordem configurada
      const buildCompanyInfoHTML = () => {
        let html = '';
        const processedItems = new Set();
        
        sortedItems.forEach((item, index) => {
          if (item.value && !processedItems.has(item.id)) {
            processedItems.add(item.id);
            
            switch (item.id) {
              case 'nome':
                // Nome já está no cabeçalho
                break;
              case 'telefone':
                if (index === 0 || (index === 1 && sortedItems[0].id === 'nome')) {
                  html += getCompanyField('telefone');
                } else {
                  html += html ? `<br>${getCompanyField('telefone')}` : getCompanyField('telefone');
                }
                break;
              case 'email':
                if (html && !html.endsWith('<br>')) {
                  html += ` • ${getCompanyField('email')}`;
                } else {
                  html += html ? `<br>${getCompanyField('email')}` : getCompanyField('email');
                }
                break;
              case 'website':
                html += html ? `<br>${getCompanyField('website')}` : getCompanyField('website');
                break;
              case 'endereco':
                html += html ? `<br>${getCompanyField('endereco')}` : getCompanyField('endereco');
                break;
              case 'cnpj':
                html += html ? `<br>CNPJ: ${getCompanyField('cnpj')}` : `CNPJ: ${getCompanyField('cnpj')}`;
                break;
            }
          }
        });
        
        return html;
      };

      // Construir redes sociais seguindo a ordem configurada
      const buildSocialLinksHTML = () => {
        let html = '';
        const socialItems = sortedItems.filter(item => 
          ['whatsapp', 'instagram', 'facebook'].includes(item.id) && getCompanyField(item.id)
        );
        
        socialItems.forEach(item => {
          const value = getCompanyField(item.id);
          if (value) {
            switch (item.id) {
              case 'whatsapp':
                html += `${html ? '<br>' : ''}💬 WhatsApp: ${value}`;
                break;
              case 'instagram':
                html += `${html ? '<br>' : ''}📱 Instagram: ${value}`;
                break;
              case 'facebook':
                html += `${html ? '<br>' : ''}👥 Facebook: ${value}`;
                break;
            }
          }
        });
        
        return html;
      };

      // Gerar HTML com configurações personalizadas
      const htmlBase = generateReceiptHTML(dadosRecibo, infoEmpresa);
      
      // Aplicar personalizações visuais
      const htmlPersonalizado = htmlBase
        .replace(
          /:root {/,
          `:root {
            --primary: ${configuracoesVisuais.template.primaryColor};
            --success: ${configuracoesVisuais.template.secondaryColor};
            --warning: ${configuracoesVisuais.template.accentColor};
            --radius: ${configuracoesVisuais.template.borderRadius};
            --card-shadow: ${configuracoesVisuais.template.cardShadow};`
        )
        .replace(
          /<title>Recibo - [^<]*<\/title>/,
          `<title>Recibo - ${dadosRecibo.eventoId}</title>
          <style>
            body { 
              font-family: '${configuracoesVisuais.template.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            ${!configuracoesVisuais.template.showGradient ? `.receipt-header { background: ${configuracoesVisuais.template.primaryColor} !important; }` : ''}
            ${!configuracoesVisuais.template.showLogo ? `.company-logo { display: none !important; }` : ''}
          </style>`
        )
        .replace(/RECIBO DE PAGAMENTO/g, configuracoesVisuais.template.headerTitle)
        .replace(/Obrigado pela preferência!/g, configuracoesVisuais.template.footerText)
        .replace(
          /<div class="company-info">[\s\S]*?<\/div>/,
          `<div class="company-info">${buildCompanyInfoHTML()}</div>`
        )
        .replace(
          /<div class="social-links">[\s\S]*?<\/div>/,
          buildSocialLinksHTML() ? `<div class="social-links">${buildSocialLinksHTML()}</div>` : ''
        );

      // Fazer download do HTML personalizado
      const blob = new Blob([htmlPersonalizado], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-${dadosRecibo.eventoId}-${dadosRecibo.clienteNome.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } else {
      // Usar geração padrão se não há configurações personalizadas
      downloadReceiptHTML(dadosRecibo, infoEmpresa);
    }
    
    logger.info('[gerarReciboEvento] Recibo gerado com sucesso com dados da empresa');
    
    // Retornar blob vazio para manter compatibilidade
    const htmlBlob = new Blob([''], { type: 'text/html' });
    
    return {
      recibo: htmlBlob,
      evento: eventoConvertido,
      telefoneCliente: eventoConvertido.phone || undefined
    };
  } catch (error) {
    logger.error('[gerarReciboEvento] Erro:', error);
    throw error;
  }
};