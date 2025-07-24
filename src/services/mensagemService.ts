import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { processEmojisForWhatsApp, encodeTextWithEmojisForURL } from '@/utils/emojiUtils';
import { formatarValorMonetario } from '@/utils/formatters';

// Tipos para mensagens e templates
export interface MensagemTemplate {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  user_id: string;
  criado_em: string;
  atualizado_em: string;
}

export interface MensagemConfiguracao {
  id: string;
  user_id: string;
  canal_whatsapp: boolean;
  canal_email: boolean;
  canal_sms: boolean;
  webhook_url: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface MensagemGatilho {
  id: string;
  user_id: string;
  trigger: string;
  template_id: string;
  antecedencia: string;
  frequencia: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

// Templates padrão do sistema
const TEMPLATES_PADRAO: Omit<MensagemTemplate, 'id' | 'user_id' | 'criado_em' | 'atualizado_em'>[] = [
  {
    titulo: "Lembrete de Sessão",
    categoria: "lembrete",
    tags: ["agenda", "lembrete"],
    conteudo: `Olá {nome_cliente}, tudo bem?

Passando para lembrar que temos uma sessão agendada para {data_evento} às {hora_evento}.

Local: {local_evento}

Qualquer dúvida, estou à disposição.

Atenciosamente,
{nome_empresa}`
  },
  {
    titulo: "Confirmação de Agendamento",
    categoria: "confirmacao",
    tags: ["agenda", "confirmacao"],
    conteudo: `Olá {nome_cliente}!

Seu agendamento foi confirmado com sucesso! \u2705

Detalhes da sessão:
\u{1F4CB} Serviço: {titulo_evento}
\u{1F4C5} Data: {data_evento}
\u{1F557} Horário: {hora_evento}
\u{1F4CD} Local: {local_evento}
\u{1F4B0} Valor: R$ {valor_entrada}

Aguardamos você!

{nome_empresa}
{telefone_empresa}`
  },
  {
    titulo: "Confirmação de Pagamento",
    categoria: "pagamento",
    tags: ["financeiro", "pagamento"],
    conteudo: `Olá {nome_cliente}!

Confirmamos o recebimento do seu pagamento! \u2705

\u{1F4CB} Detalhes do pagamento:
\u{1F4B0} Valor: R$ {valor_entrada}
\u{1F4C5} Data: {data_atual}
\u{1F4CB} Referente: {titulo_evento}
\u{1F9FE} Comprovante: {data_atual}

Obrigado pela confiança!

{nome_empresa}
{telefone_empresa}`
  },
  {
    titulo: "Entrega de Fotos",
    categoria: "geral",
    tags: ["fotos", "entrega"],
    conteudo: `Olá {nome_cliente}! \u{1F4F8}

Suas fotos estão prontas! \u{1F389}

\u{1F4C5} Sessão: {data_evento}
\u{1F517} Link para download: [Suas fotos aqui]
\u{1F4C5} Total de fotos: 30 imagens editadas

As fotos ficarão disponíveis por 30 dias.

{nome_empresa}
{telefone_empresa}`
  },
  {
    titulo: "Promoção Personalizada",
    categoria: "geral",
    tags: ["promocao", "marketing"],
    conteudo: `Olá {nome_cliente}! \u2728

Temos uma promoção especial para você!

\u{1F3AF} Oferta exclusiva para nossos clientes
\u{1F4B0} Condições especiais disponíveis
\u{1F4DE} Entre em contato para mais detalhes

Não perca essa oportunidade!

{nome_empresa}
{telefone_empresa}`
  }
];

// Variáveis disponíveis para substituição nos templates
export const VARIAVEIS_DISPONIVEIS = {
  cliente: [
    { placeholder: '{nome_cliente}', descricao: 'Nome do cliente' },
    { placeholder: '{telefone}', descricao: 'Telefone do cliente' },
    { placeholder: '{endereco_cliente}', descricao: 'Endereço do cliente' },
    { placeholder: '{cpf_cliente}', descricao: 'CPF do cliente' },
  ],
  evento: [
    { placeholder: '{data_evento}', descricao: 'Data do evento' },
    { placeholder: '{hora_evento}', descricao: 'Horário do evento' },
    { placeholder: '{data_inicio}', descricao: 'Data de início do evento' },
    { placeholder: '{data_fim}', descricao: 'Data de fim do evento' },
    { placeholder: '{local_evento}', descricao: 'Local do evento' },
    { placeholder: '{titulo_evento}', descricao: 'Título/descrição do evento' },
    { placeholder: '{descricao}', descricao: 'Descrição detalhada do evento' },
    { placeholder: '{observacoes}', descricao: 'Observações do evento' },
    { placeholder: '{valor_entrada}', descricao: 'Valor de entrada do evento' },
  ],
  financeiro: [
    { placeholder: '{valor_total}', descricao: 'Valor total do serviço' },
    { placeholder: '{valor_restante}', descricao: 'Valor restante a receber' },
  ],
  empresa: [
    { placeholder: '{nome_empresa}', descricao: 'Nome da empresa' },
    { placeholder: '{telefone_empresa}', descricao: 'Telefone da empresa' },
    { placeholder: '{email_empresa}', descricao: 'E-mail da empresa' },
  ],
  sistema: [
    { placeholder: '{data_atual}', descricao: 'Data atual' },
    { placeholder: '{hora_atual}', descricao: 'Hora atual' },
  ]
};

// Cache para templates (adicionado)
let templateCache: {
  [userId: string]: {
    data: MensagemTemplate[],
    timestamp: number
  }
} = {};

// Tempo de expiração do cache em ms (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Buscar todos os templates do usuário
 */
export const buscarTemplates = async (userId: string): Promise<MensagemTemplate[]> => {
  try {
    logger.debug('Buscando templates de mensagem', { userId }, 'mensagemService');
    
    // Verificar se existe cache válido
    const cacheKey = userId;
    const currentTime = Date.now();
    
    if (
      templateCache[cacheKey] && 
      (currentTime - templateCache[cacheKey].timestamp) < CACHE_EXPIRATION
    ) {
      logger.debug('Usando templates em cache', { count: templateCache[cacheKey].data.length }, 'mensagemService');
      return templateCache[cacheKey].data;
    }
    
    // Não tem cache ou cache expirado, buscar do banco
    const { data, error } = await supabase
      .from('mensagens_modelos')
      .select('id, titulo, conteudo, categoria, tags, user_id, criado_em, atualizado_em') // Incluir conteudo
      .eq('user_id', userId)
      .order('criado_em', { ascending: false });
    
    if (error) {
      logger.error('Erro ao buscar templates', error, 'mensagemService');
      throw error;
    }
    
    logger.debug(`${data?.length || 0} templates encontrados`, null, 'mensagemService');
    
    // Armazenar no cache
    templateCache[cacheKey] = {
      data: data?.map(template => ({
        ...template,
        conteudo: template.conteudo || ''
      })) || [],
      timestamp: currentTime
    };
    
    return data?.map(template => ({
      ...template,
      conteudo: template.conteudo || ''
    })) || [];
  } catch (error) {
    logger.error('Exceção ao buscar templates', error, 'mensagemService');
    throw error;
  }
};

/**
 * Buscar template por ID (com conteúdo completo)
 */
export const buscarTemplatePorId = async (id: string, userId: string): Promise<MensagemTemplate | null> => {
  try {
    logger.debug('Buscando template por ID', { id, userId }, 'mensagemService');
    
    // Verificar se existe no cache
    const cacheKey = userId;
    if (templateCache[cacheKey]) {
      const templateCached = templateCache[cacheKey].data.find(t => t.id === id);
      
      // Se o template estiver em cache e tiver o conteúdo, retornar do cache
      if (templateCached && templateCached.conteudo) {
        logger.debug('Template encontrado no cache', { id }, 'mensagemService');
        return templateCached;
      }
    }
    
    // Buscar do banco com todos os campos
    const { data, error } = await supabase
      .from('mensagens_modelos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        logger.debug('Template não encontrado', { id }, 'mensagemService');
        return null;
      }
      logger.error('Erro ao buscar template por ID', error, 'mensagemService');
      throw error;
    }
    
    // Atualizar o cache se ele existir
    if (templateCache[cacheKey] && data) {
      const index = templateCache[cacheKey].data.findIndex(t => t.id === id);
      if (index >= 0) {
        templateCache[cacheKey].data[index] = data;
      }
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao buscar template por ID', error, 'mensagemService');
    throw error;
  }
};

/**
 * Buscar template por título (para verificar duplicatas)
 */
export const buscarTemplatePorTitulo = async (titulo: string, userId: string): Promise<MensagemTemplate | null> => {
  try {
    logger.debug('Buscando template por título', { titulo, userId }, 'mensagemService');
    
    // Verificar se existe no cache primeiro
    const cacheKey = userId;
    if (templateCache[cacheKey]) {
      const templateCached = templateCache[cacheKey].data.find(t => t.titulo === titulo);
      if (templateCached) {
        logger.debug('Template encontrado no cache por título', { titulo }, 'mensagemService');
        return templateCached;
      }
    }
    
    // Buscar do banco
    const { data, error } = await supabase
      .from('mensagens_modelos')
      .select('*')
      .eq('titulo', titulo)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        logger.debug('Template não encontrado por título', { titulo }, 'mensagemService');
        return null;
      }
      logger.error('Erro ao buscar template por título', error, 'mensagemService');
      throw error;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao buscar template por título', error, 'mensagemService');
    throw error;
  }
};

/**
 * Limpar cache de templates
 */
export const limparCacheTemplates = (userId?: string): void => {
  if (userId) {
    delete templateCache[userId];
    logger.debug('Cache de templates limpo para usuário específico', { userId }, 'mensagemService');
  } else {
    templateCache = {};
    logger.debug('Cache de templates limpo completamente', null, 'mensagemService');
  }
};

/**
 * Criar novo template
 */
export const criarTemplate = async (template: Omit<MensagemTemplate, 'id' | 'criado_em' | 'atualizado_em'>, userId: string): Promise<MensagemTemplate> => {
  try {
    logger.debug('Criando novo template', { titulo: template.titulo, userId }, 'mensagemService');
    
    // Remover user_id do template e usar o fornecido como parâmetro
    const { user_id, ...dadosTemplate } = template;
    
    const { data, error } = await supabase
      .from('mensagens_modelos')
      .insert([{
        ...dadosTemplate,
        user_id: userId
      }])
      .select()
      .single();
    
    if (error) {
      logger.error('Erro ao criar template', error, 'mensagemService');
      throw error;
    }
    
    if (!data) {
      throw new Error('Nenhum dado retornado após criação do template');
    }
    
    logger.info('Template criado com sucesso', { id: data.id, titulo: template.titulo }, 'mensagemService');
    return data;
  } catch (error) {
    logger.error('Exceção ao criar template', error, 'mensagemService');
    throw error;
  }
};

/**
 * Atualizar template existente
 */
export const atualizarTemplate = async (id: string, template: Partial<MensagemTemplate>, userId: string): Promise<void> => {
  try {
    logger.debug('Atualizando template', { id, userId }, 'mensagemService');
    
    // Remover campos que não devem ser atualizados
    const { user_id, id: templateId, criado_em, atualizado_em, ...dadosParaAtualizar } = template;
    
    const { error } = await supabase
      .from('mensagens_modelos')
      .update({
        ...dadosParaAtualizar,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      logger.error('Erro ao atualizar template', error, 'mensagemService');
      throw error;
    }
    
    logger.info('Template atualizado com sucesso', { id }, 'mensagemService');
  } catch (error) {
    logger.error('Exceção ao atualizar template', error, 'mensagemService');
    throw error;
  }
};

/**
 * Deletar template
 */
export const deletarTemplate = async (id: string, userId: string): Promise<void> => {
  try {
    logger.debug('Deletando template', { id, userId }, 'mensagemService');
    
    const { error } = await supabase
      .from('mensagens_modelos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      logger.error('Erro ao deletar template', error, 'mensagemService');
      throw error;
    }
    
    logger.info('Template deletado com sucesso', { id }, 'mensagemService');
  } catch (error) {
    logger.error('Exceção ao deletar template', error, 'mensagemService');
    throw error;
  }
};

/**
 * Buscar configuração do usuário
 */
export const buscarConfiguracao = async (userId: string): Promise<MensagemConfiguracao | null> => {
  try {
    logger.debug('Buscando configuração de mensagens', { userId }, 'mensagemService');
    
    const { data, error } = await supabase
      .from('mensagens_configuracoes')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        logger.debug('Configuração não encontrada', { userId }, 'mensagemService');
        return null;
      }
      logger.error('Erro ao buscar configuração', error, 'mensagemService');
      throw error;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao buscar configuração', error, 'mensagemService');
    throw error;
  }
};

/**
 * Salvar configuração do usuário
 */
export const salvarConfiguracao = async (configuracao: Omit<MensagemConfiguracao, 'id' | 'criado_em' | 'atualizado_em'>, userId: string): Promise<MensagemConfiguracao> => {
  try {
    logger.debug('Salvando configuração de mensagens', { userId }, 'mensagemService');
    
    // Verificar se já existe configuração
    const configExistente = await buscarConfiguracao(userId);
    
    if (configExistente) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('mensagens_configuracoes')
        .update({
          ...configuracao,
          user_id: userId,
          atualizado_em: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao atualizar configuração', error, 'mensagemService');
        throw error;
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após atualização da configuração');
      }
      
      logger.info('Configuração atualizada com sucesso', { userId }, 'mensagemService');
      return data;
    } else {
      // Criar nova
      const { data, error } = await supabase
        .from('mensagens_configuracoes')
        .insert([{
          ...configuracao,
          user_id: userId
        }])
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao criar configuração', error, 'mensagemService');
        throw error;
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após criação da configuração');
      }
      
      logger.info('Configuração criada com sucesso', { userId }, 'mensagemService');
      return data;
    }
  } catch (error) {
    logger.error('Exceção ao salvar configuração', error, 'mensagemService');
    throw error;
  }
};

/**
 * Buscar gatilhos do usuário
 */
export const buscarGatilhos = async (userId: string): Promise<MensagemGatilho[]> => {
  try {
    logger.debug('Buscando gatilhos de mensagem', { userId }, 'mensagemService');
    
    const { data, error } = await supabase
      .from('mensagens_gatilhos')
      .select('*')
      .eq('user_id', userId)
      .order('criado_em', { ascending: false });
    
    if (error) {
      logger.error('Erro ao buscar gatilhos', error, 'mensagemService');
      throw error;
    }
    
    // Converter tipos para string conforme interface
    return (data || []).map(item => ({
      ...item,
      antecedencia: String(item.antecedencia || ''),
      frequencia: String(item.frequencia || '')
    }));
  } catch (error) {
    logger.error('Exceção ao buscar gatilhos', error, 'mensagemService');
    throw error;
  }
};

/**
 * Salvar gatilho
 */
export const salvarGatilho = async (gatilho: Omit<MensagemGatilho, 'id' | 'criado_em' | 'atualizado_em'>, userId: string): Promise<MensagemGatilho> => {
  try {
    logger.debug('Salvando gatilho de mensagem', { trigger: gatilho.trigger, userId }, 'mensagemService');
    
    const { data, error } = await supabase
      .from('mensagens_gatilhos')
      .upsert({
        ...gatilho,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) {
      logger.error('Erro ao salvar gatilho', error, 'mensagemService');
      throw error;
    }
    
    if (!data) {
      throw new Error('Nenhum dado retornado após salvar gatilho');
    }
    
    const gatilhoSalvo = {
      ...data,
      antecedencia: String(data.antecedencia || ''),
      frequencia: String(data.frequencia || '')
    };
    
    logger.info('Gatilho salvo com sucesso', { id: gatilhoSalvo.id }, 'mensagemService');
    return gatilhoSalvo;
  } catch (error) {
    logger.error('Exceção ao salvar gatilho', error, 'mensagemService');
    throw error;
  }
};

/**
 * Restaurar template padrão
 */
export const restaurarTemplatePadrao = async (categoria: string, userId: string): Promise<MensagemTemplate> => {
  try {
    logger.debug('Restaurando template padrão', { categoria, userId }, 'mensagemService');
    
    const templatePadrao = TEMPLATES_PADRAO.find(t => t.categoria === categoria);
    
    if (!templatePadrao) {
      throw new Error(`Template padrão não encontrado para categoria: ${categoria}`);
    }
    
    // Buscar se já existe um template desta categoria
    const { data: existente } = await supabase
      .from('mensagens_modelos')
      .select('id')
      .eq('user_id', userId)
      .eq('categoria', categoria)
      .single();
    
    if (existente) {
      // Atualizar existente
      await atualizarTemplate(existente.id, { ...templatePadrao, user_id: userId }, userId);
      return await buscarTemplatePorId(existente.id, userId) as MensagemTemplate;
    } else {
      // Criar novo
      return await criarTemplate({ ...templatePadrao, user_id: userId }, userId);
    }
  } catch (error) {
    logger.error('Exceção ao restaurar template padrão', error, 'mensagemService');
    throw error;
  }
};

/**
 * Renderizar preview do template com dados de teste
 */
export const renderizarPreview = async (conteudo: string): Promise<string> => {
  return await substituirVariaveis(conteudo);
};

/**
 * Preparar mensagem para envio via WhatsApp com encoding correto
 * @param conteudo - Conteúdo da mensagem com variáveis
 * @param eventoSelecionado - Dados do evento (opcional)
 * @returns Mensagem processada e codificada para WhatsApp
 */
export const prepararMensagemWhatsApp = async (
  conteudo: string, 
  eventoSelecionado?: any
): Promise<{ mensagemProcessada: string; mensagemCodificada: string }> => {
  try {
    // 1. Substituir variáveis e processar emojis
    const mensagemProcessada = await substituirVariaveis(conteudo, eventoSelecionado);
    
    // 2. Codificar para URL preservando emojis Unicode
    const mensagemCodificada = encodeTextWithEmojisForURL(mensagemProcessada);
    
    logger.debug('Mensagem preparada para WhatsApp', {
      original: conteudo.substring(0, 100) + '...',
      processada: mensagemProcessada.substring(0, 100) + '...',
      codificada: mensagemCodificada.substring(0, 100) + '...'
    }, 'mensagemService');
    
    return {
      mensagemProcessada,
      mensagemCodificada
    };
  } catch (error) {
    logger.error('Erro ao preparar mensagem para WhatsApp', error, 'mensagemService');
    throw error;
  }
};

/**
 * Função unificada para substituição de variáveis
 * Busca dados reais da empresa e usa dados de teste para cliente/evento quando não fornecidos
 */
export const substituirVariaveis = async (
  conteudo: string, 
  eventoSelecionado?: any
): Promise<string> => {
  // Primeiro, substituir caracteres \n literais por quebras de linha reais
  let conteudoProcessado = conteudo.replace(/\\n/g, '\n');
  
  // Converter formato antigo {{variavel}} para formato novo {variavel}
  conteudoProcessado = conteudoProcessado.replace(/{{([^}]+)}}/g, '{$1}');
  
  // 1. BUSCAR DADOS DA EMPRESA (sempre dados reais)
  let dadosEmpresa = {
    nome_empresa: 'Sua Empresa',
    telefone_empresa: '(00)0 0000-0000',
    email_empresa: 'contato@empresa.com',
    nome_fotografo: 'Profissional'
  };
  
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Buscar dados da empresa com todos os campos necessários
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('nome_empresa, telefone, email_empresa')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        // Função para formatar telefone
        const formatarTelefone = (telefone: string | null): string => {
          if (!telefone) return dadosEmpresa.telefone_empresa;
          
          // Remove todos os caracteres não numéricos
          const numeroLimpo = telefone.replace(/\D/g, '');
          
          // Se não tem números suficientes, retorna o padrão
          if (numeroLimpo.length < 10) return dadosEmpresa.telefone_empresa;
          
          // Formatar telefone brasileiro
          if (numeroLimpo.length === 11) {
            // Celular: (XX) 9XXXX-XXXX
            return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`;
          } else if (numeroLimpo.length === 10) {
            // Fixo: (XX) XXXX-XXXX
            return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 6)}-${numeroLimpo.slice(6)}`;
          }
          
          return telefone; // Retorna como está se não conseguir formatar
        };
        
        // Mapear corretamente os campos da empresa
        dadosEmpresa.nome_empresa = data.nome_empresa || dadosEmpresa.nome_empresa;
        dadosEmpresa.telefone_empresa = formatarTelefone(data.telefone);
        dadosEmpresa.email_empresa = data.email_empresa || dadosEmpresa.email_empresa;
        dadosEmpresa.nome_fotografo = data.nome_empresa || dadosEmpresa.nome_fotografo;
        
        // Log para debug
        logger.info('Dados da empresa carregados:', {
          nome_empresa: dadosEmpresa.nome_empresa,
          telefone_empresa: dadosEmpresa.telefone_empresa,
          email_empresa: dadosEmpresa.email_empresa
        }, 'mensagemService');
      } else if (error) {
        logger.error('Erro ao buscar configurações da empresa:', error, 'mensagemService');
      } else {
        logger.warn('Nenhuma configuração de empresa encontrada para o usuário', null, 'mensagemService');
      }
    } else {
      logger.warn('Usuário não autenticado ao buscar dados da empresa', null, 'mensagemService');
    }
  } catch (error) {
    logger.error('Erro ao buscar dados da empresa', error, 'mensagemService');
  }
  
  // 2. BUSCAR DADOS DO EVENTO (dados reais se evento selecionado, senão dados de teste)
  let dadosEvento = {
    nome_cliente: 'João Silva',
    telefone: '(11)9 9999-9999',
    endereco_cliente: 'Rua das Flores, 123 - Centro',
    cpf_cliente: '123.456.789-00',
    data_evento: '15/01/2025',
    hora_evento: '14:30',
    data_inicio: '15/01/2025 14:30',
    data_fim: '15/01/2025 16:30',
    local_evento: 'Consultório - Sala 1',
    titulo_evento: 'Consulta Psicológica',
    descricao: 'Sessão de terapia individual com foco em ansiedade',
    observacoes: 'Cliente prefere horário da tarde',
    valor_entrada: formatarValorMonetario(150),
    valor_total: formatarValorMonetario(500),
    valor_restante: formatarValorMonetario(350)
  };
  
  if (eventoSelecionado) {
    try {
      // Buscar dados adicionais do evento se existir ID
      let dadosEventoCompleto = eventoSelecionado;
      
      if (eventoSelecionado.id) {
        const { data, error } = await supabase
          .from('agenda_eventos')
          .select('*')
          .eq('id', eventoSelecionado.id)
          .single();
        
        if (!error && data) {
          dadosEventoCompleto = { ...eventoSelecionado, ...data };
        }
      }
      
      // Função para formatar data
      const formatarData = (data: string | undefined | null) => {
        if (!data) return dadosEvento.data_evento;
        try {
          return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
          return data;
        }
      };
      
      // Função para formatar hora
      const formatarHora = (data: string | undefined | null) => {
        if (!data) return dadosEvento.hora_evento;
        try {
          if (typeof data === 'string' && /^\d{1,2}:\d{2}$/.test(data)) {
            return data;
          }
          return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        } catch (e) {
          return dadosEvento.hora_evento;
        }
      };
      
      // Função para formatar telefone do cliente
      const formatarTelefoneCliente = (telefone: string | null): string => {
        if (!telefone) return dadosEvento.telefone;
        
        // Remove todos os caracteres não numéricos
        const numeroLimpo = telefone.replace(/\D/g, '');
        
        // Se não tem números suficientes, retorna o padrão
        if (numeroLimpo.length < 10) return dadosEvento.telefone;
        
        // Formatar telefone brasileiro no formato (00)0 0000-0000
        if (numeroLimpo.length === 11) {
          // Celular: (00)0 0000-0000
          return `(${numeroLimpo.slice(0, 2)})${numeroLimpo.slice(2, 3)} ${numeroLimpo.slice(3, 7)}-${numeroLimpo.slice(7)}`;
        } else if (numeroLimpo.length === 10) {
          // Fixo: (00) 0000-0000
          return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 6)}-${numeroLimpo.slice(6)}`;
        }
        
        return telefone; // Retorna como está se não conseguir formatar
      };

      // Atualizar dados do evento com dados reais
      dadosEvento = {
        nome_cliente: dadosEventoCompleto.clientName || dadosEventoCompleto.titulo || dadosEvento.nome_cliente,
        telefone: formatarTelefoneCliente(dadosEventoCompleto.phone || dadosEventoCompleto.telefone),
        endereco_cliente: dadosEventoCompleto.endereco_cliente || dadosEvento.endereco_cliente,
        cpf_cliente: dadosEventoCompleto.cpf_cliente || dadosEvento.cpf_cliente,
        data_evento: formatarData(dadosEventoCompleto.date || dadosEventoCompleto.data_inicio),
        hora_evento: formatarHora(dadosEventoCompleto.time || dadosEventoCompleto.data_inicio),
        data_inicio: `${formatarData(dadosEventoCompleto.date || dadosEventoCompleto.data_inicio)} ${formatarHora(dadosEventoCompleto.time || dadosEventoCompleto.data_inicio)}`,
        data_fim: formatarData(dadosEventoCompleto.data_fim),
        local_evento: dadosEventoCompleto.location || dadosEventoCompleto.local || dadosEvento.local_evento,
        titulo_evento: dadosEventoCompleto.eventType || dadosEventoCompleto.tipo || dadosEvento.titulo_evento,
        descricao: dadosEventoCompleto.descricao || dadosEvento.descricao,
        observacoes: dadosEventoCompleto.notes || dadosEventoCompleto.observacoes || dadosEvento.observacoes,
        valor_entrada: formatarValorMonetario(dadosEventoCompleto.downPayment || dadosEventoCompleto.valor_entrada || 0),
        valor_total: formatarValorMonetario(dadosEventoCompleto.totalValue || dadosEventoCompleto.valor_total || 0),
        valor_restante: formatarValorMonetario(dadosEventoCompleto.remainingValue || dadosEventoCompleto.valor_restante || 0)
      };
    } catch (error) {
      logger.error('Erro ao buscar dados do evento', error, 'mensagemService');
    }
  }
  
  // 3. DADOS DO SISTEMA (sempre atuais)
  const dadosSistema = {
    data_atual: new Date().toLocaleDateString('pt-BR'),
    hora_atual: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
  
  // 4. MAPEAMENTO COMPLETO DE VARIÁVEIS
  const variaveis = {
    // Dados do cliente
    '{nome_cliente}': dadosEvento.nome_cliente,
    '{telefone}': dadosEvento.telefone,
    '{endereco_cliente}': dadosEvento.endereco_cliente,
    '{cpf_cliente}': dadosEvento.cpf_cliente,
    
    // Dados do evento
    '{data_evento}': dadosEvento.data_evento,
    '{hora_evento}': dadosEvento.hora_evento,
    '{data_inicio}': dadosEvento.data_inicio,
    '{data_fim}': dadosEvento.data_fim,
    '{local_evento}': dadosEvento.local_evento,
    '{titulo_evento}': dadosEvento.titulo_evento,
    '{descricao}': dadosEvento.descricao,
    '{observacoes}': dadosEvento.observacoes,
    
    // Dados financeiros
    '{valor_entrada}': dadosEvento.valor_entrada,
    '{valor_total}': dadosEvento.valor_total,
    '{valor_restante}': dadosEvento.valor_restante,
    
    // Dados da empresa
    '{nome_empresa}': dadosEmpresa.nome_empresa,
    '{nome_fotografo}': dadosEmpresa.nome_fotografo,
    '{telefone_empresa}': dadosEmpresa.telefone_empresa,
    '{email_empresa}': dadosEmpresa.email_empresa,
    
    // Dados do sistema
    '{data_atual}': dadosSistema.data_atual,
    '{hora_atual}': dadosSistema.hora_atual
  };
  
  // 5. SUBSTITUIR VARIÁVEIS NO CONTEÚDO
  Object.entries(variaveis).forEach(([placeholder, valor]) => {
    conteudoProcessado = conteudoProcessado.replace(
      new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
      valor || placeholder
    );
  });
  
  // 6. PROCESSAR EMOJIS PARA COMPATIBILIDADE COM WHATSAPP
  // Aplicar processamento de emoji após substituição de variáveis
  conteudoProcessado = processEmojisForWhatsApp(conteudoProcessado);
  
  return conteudoProcessado;
};

/**
 * Função de teste para verificar o processamento de mensagens
 */
export const testarRenderizacaoMensagem = async (mensagem: string): Promise<string> => {
  console.log("Mensagem original:", mensagem);
  
  // Substituir \n literais por quebras de linha reais
  const mensagemComQuebrasDeLinha = mensagem.replace(/\\n/g, '\n');
  console.log("Mensagem com quebras de linha:", mensagemComQuebrasDeLinha);
  
  // Renderizar com substituição de variáveis
  try {
    const resultado = await renderizarPreview(mensagem);
    console.log("Resultado final:", resultado);
    return resultado;
  } catch (error) {
    console.error("Erro ao renderizar preview:", error);
    return "Erro ao processar mensagem";
  }
};

/**
 * Inicializa templates padrão para novos usuários
 * Esta função SEMPRE cria os templates padrão, independente de já existirem ou não
 * Use apenas quando o usuário explicitamente solicitar a criação dos templates padrão
 */
export const inicializarTemplatesPadrao = async (userId: string): Promise<MensagemTemplate[]> => {
  try {
    logger.info('Iniciando criação de templates padrão por solicitação do usuário', { userId, totalTemplates: TEMPLATES_PADRAO.length }, 'mensagemService');
    
    // Limpar cache primeiro para garantir dados atualizados
    limparCacheTemplates(userId);
    
    const templatesNovos: MensagemTemplate[] = [];
    
    // Criar templates um por um para melhor controle de erros
    for (const templatePadrao of TEMPLATES_PADRAO) {
      try {
        const novoTemplate = await criarTemplate({
          ...templatePadrao,
          user_id: userId
        }, userId);
        templatesNovos.push(novoTemplate);
        logger.debug('Template criado', { titulo: novoTemplate.titulo, id: novoTemplate.id }, 'mensagemService');
      } catch (error) {
        logger.error('Erro ao criar template individual', { titulo: templatePadrao.titulo, error }, 'mensagemService');
        // Continuar criando os outros templates mesmo se um falhar
      }
    }
    
    // Limpar cache novamente para garantir que os templates recém-criados sejam retornados
    limparCacheTemplates(userId);
    
    logger.info('Templates padrão criados com sucesso', { count: templatesNovos.length, userId }, 'mensagemService');
    return templatesNovos;
  } catch (error) {
    logger.error('Erro ao inicializar templates padrão', error, 'mensagemService');
    throw error;
  }
};

/**
 * Função de debug para forçar recriação dos templates padrão
 */
export const forcarRecriacaoTemplatesPadrao = async (userId: string): Promise<MensagemTemplate[]> => {
  try {
    logger.info('Forçando recriação dos templates padrão', { userId }, 'mensagemService');
    
    // Limpar cache
    limparCacheTemplates(userId);
    
    // Deletar todos os templates existentes do usuário
    const { error: errorDelete } = await supabase
      .from('mensagens_modelos')
      .delete()
      .eq('user_id', userId);
    
    if (errorDelete) {
      logger.error('Erro ao deletar templates existentes', errorDelete, 'mensagemService');
    }
    
    // Criar novos templates
    const templatesNovos: MensagemTemplate[] = [];
    
    for (const templatePadrao of TEMPLATES_PADRAO) {
      try {
        const novoTemplate = await criarTemplate({
          ...templatePadrao,
          user_id: userId
        }, userId);
        templatesNovos.push(novoTemplate);
        logger.debug('Template recriado', { titulo: novoTemplate.titulo, id: novoTemplate.id }, 'mensagemService');
      } catch (error) {
        logger.error('Erro ao recriar template individual', { titulo: templatePadrao.titulo, error }, 'mensagemService');
      }
    }
    
    limparCacheTemplates(userId);
    
    logger.info('Templates padrão recriados com sucesso', { count: templatesNovos.length, userId }, 'mensagemService');
    return templatesNovos;
  } catch (error) {
    logger.error('Erro ao forçar recriação dos templates padrão', error, 'mensagemService');
    throw error;
  }
};
