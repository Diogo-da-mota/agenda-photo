import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

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
{nome_fotografo}`
  },
  {
    titulo: "Confirmação de Agendamento",
    categoria: "confirmacao",
    tags: ["agenda", "confirmacao"],
    conteudo: `Olá {nome_cliente}!

Seu agendamento foi confirmado com sucesso! ✅

Detalhes da sessão:
📋 Serviço: {titulo_evento}
📅 Data: {data_evento}
🕒 Horário: {hora_evento}
📍 Local: {local_evento}
💰 Valor: R$ {valor_entrada}

Aguardamos você!

{nome_empresa}
{telefone_empresa}`
  },
  {
    titulo: "Confirmação de Pagamento",
    categoria: "pagamento",
    tags: ["financeiro", "pagamento"],
    conteudo: `Olá {nome_cliente}!

Confirmamos o recebimento do seu pagamento! ✅

📋 Detalhes do pagamento:
💰 Valor: R$ {valor_entrada}
📅 Data: {data_atual}
📋 Referente: {titulo_evento}
🧾 Comprovante: #{data_atual}

Obrigado pela confiança!

{nome_empresa}
{telefone_empresa}`
  },
  {
    titulo: "Entrega de Fotos",
    categoria: "geral",
    tags: ["fotos", "entrega"],
    conteudo: `Olá {nome_cliente}! 📸

Suas fotos estão prontas! 🎉

📅 Sessão: {data_evento}
🔗 Link para download: [Suas fotos aqui]
📅 Total de fotos: 30 imagens editadas

As fotos ficarão disponíveis por 30 dias.

{nome_empresa}
{telefone_empresa}`
  },
  {
    titulo: "Promoção Personalizada",
    categoria: "geral",
    tags: ["promocao", "marketing"],
    conteudo: `Olá {nome_cliente}! ✨

Temos uma promoção especial para você!

🎯 Oferta exclusiva para nossos clientes
💰 Condições especiais disponíveis
📞 Entre em contato para mais detalhes

Não perca essa oportunidade!

{nome_empresa}
{telefone_empresa}`
  }
];

// Variáveis disponíveis para substituição nos templates
export const VARIAVEIS_DISPONIVEIS = {
  cliente: [
    { placeholder: '{nome_cliente}', descricao: 'Nome do cliente' },
  ],
  evento: [
    { placeholder: '{data_evento}', descricao: 'Data do evento' },
    { placeholder: '{hora_evento}', descricao: 'Horário do evento' },
    { placeholder: '{local_evento}', descricao: 'Local do evento' },
    { placeholder: '{titulo_evento}', descricao: 'Título/descrição do evento' },
    { placeholder: '{valor_entrada}', descricao: 'Valor do evento' },
  ],
  empresa: [
    { placeholder: '{nome_empresa}', descricao: 'Nome da empresa' },
    { placeholder: '{nome_fotografo}', descricao: 'Nome do profissional/fotógrafo' },
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
  // Primeiro, substituir caracteres \n literais por quebras de linha reais
  let conteudoProcessado = conteudo.replace(/\\n/g, '\n');
  
  // Converter formato antigo {{variavel}} para formato novo {variavel}
  conteudoProcessado = conteudoProcessado.replace(/{{([^}]+)}}/g, '{$1}');
  
  // Buscar configurações da empresa para usar dados reais onde possível
  let nomeEmpresa = 'Sua Empresa';
  let telefoneEmpresa = '(00) 00000-0000';
  let emailEmpresa = 'contato@empresa.com';
  let nomeFotografo = 'Profissional';
  
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Buscar dados da empresa
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('nome_empresa, telefone, email_empresa')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        nomeEmpresa = data.nome_empresa || nomeEmpresa;
        telefoneEmpresa = data.telefone || telefoneEmpresa;
        emailEmpresa = data.email_empresa || emailEmpresa;
        // O nome do fotógrafo pode ser o mesmo da empresa se não houver específico
        nomeFotografo = data.nome_empresa || nomeFotografo;
      }
    }
  } catch (error) {
    logger.error('Erro ao buscar dados da empresa para preview', error, 'mensagemService');
    // Em caso de erro, continuaremos com os valores padrão definidos acima
  }
  
  const dadosTeste = {
    '{nome_cliente}': 'João Silva',
    '{data_evento}': '15/01/2025',
    '{hora_evento}': '14:30',
    '{local_evento}': 'Consultório - Sala 1',
    '{titulo_evento}': 'Consulta Psicológica',
    '{valor_entrada}': '150,00',
    '{nome_empresa}': nomeEmpresa,
    '{nome_fotografo}': nomeFotografo,
    '{telefone_empresa}': telefoneEmpresa,
    '{email_empresa}': emailEmpresa,
    '{data_atual}': new Date().toLocaleDateString('pt-BR'),
    '{hora_atual}': new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
  
  // Substituir variáveis
  Object.entries(dadosTeste).forEach(([placeholder, valor]) => {
    conteudoProcessado = conteudoProcessado.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), valor);
  });
  
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
 * Esta função verifica se o usuário já tem templates, e se não tiver, cria os templates padrão
 */
export const inicializarTemplatesPadrao = async (userId: string): Promise<MensagemTemplate[]> => {
  try {
    logger.debug('Verificando necessidade de inicializar templates padrão', { userId }, 'mensagemService');
    
    // Verificar se o usuário já tem templates
    const templatesExistentes = await buscarTemplates(userId);
    
    if (templatesExistentes.length > 0) {
      logger.debug('Usuário já possui templates, pulando inicialização', { count: templatesExistentes.length }, 'mensagemService');
      return templatesExistentes;
    }
    
    // Usuário não tem templates, vamos criar os padrão
    logger.info('Criando templates padrão para novo usuário', { userId }, 'mensagemService');
    
    const promisesTemplates = TEMPLATES_PADRAO.map(templatePadrao => 
      criarTemplate({
        ...templatePadrao,
        user_id: userId
      }, userId)
    );
    
    const templatesNovos = await Promise.all(promisesTemplates);
    
    // Limpar cache para garantir que os templates recém-criados sejam retornados
    limparCacheTemplates(userId);
    
    logger.info('Templates padrão criados com sucesso', { count: templatesNovos.length, userId }, 'mensagemService');
    return templatesNovos;
  } catch (error) {
    logger.error('Erro ao inicializar templates padrão', error, 'mensagemService');
    throw error;
  }
}; 
