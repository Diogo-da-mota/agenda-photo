import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// Interface para configurações de integração
interface ConfiguracaoIntegracao {
  id: string;
  user_id: string;
  webhook_url?: string;
  webhook_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Interface simplificada para webhook
interface WebhookConfig {
  user_id: string;
  webhook_enabled: boolean;
  webhook_url?: string;
}

// Interface para as configurações de webhook incluindo eventos
interface WebhookSettings {
  webhookUrl: string;
  enabled: boolean;
  events: string[];
}

/**
 * Obtém a configuração de webhook para o usuário
 */
export const getWebhookConfig = async (userId?: string): Promise<WebhookConfig | null> => {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('Usuário não autenticado');
        return null;
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('configuracoes_integracoes')
      .select('webhook_enabled, webhook_url')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      logger.info('Configuração de webhook não encontrada, usando padrão:', { userId });
      // Configuração padrão quando não encontrada
      return {
        user_id: userId,
        webhook_enabled: false,
        webhook_url: undefined
      };
    }

    const config: WebhookConfig = {
      user_id: userId,
      webhook_enabled: !!data.webhook_enabled,
      webhook_url: data.webhook_url
    };

    logger.info('Configuração de webhook obtida:', config);
    return config;
  } catch (error) {
    logger.error('Erro ao obter configuração de webhook:', error);
    return null;
  }
};

/**
 * Atualiza a URL do webhook e seu status de ativação
 */
export const updateWebhookUrl = async (
  webhookUrl: string,
  enabled: boolean
): Promise<{ success: boolean; data?: ConfiguracaoIntegracao; error?: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logger.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('configuracoes_integracoes')
      .upsert({
        user_id: user.id,
        webhook_url: webhookUrl,
        webhook_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Erro ao atualizar URL do webhook:', error);
    } else {
      logger.info('URL do webhook atualizada com sucesso');
    }

    return {
      success: !error,
      data: data as ConfiguracaoIntegracao,
      error,
    };
  } catch (error) {
    logger.error('Erro ao atualizar URL do webhook:', error);
    return { success: false, error };
  }
};

/**
 * Atualiza a configuração de webhook do usuário
 */
export const updateWebhookConfig = async (userId: string, config: Partial<WebhookConfig>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logger.error('Usuário não autenticado');
      return false;
    }

    // Garantir que o userId corresponde ao usuário autenticado
    if (userId !== user.id) {
      logger.error('Tentativa de atualizar webhook de outro usuário');
      return false;
    }

    const { error } = await supabase
      .from('configuracoes_integracoes')
      .upsert({
        user_id: userId,
        webhook_enabled: config.webhook_enabled,
        webhook_url: config.webhook_url,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('Erro ao atualizar configuração de webhook:', error);
      return false;
    }

    logger.info('Configuração de webhook atualizada com sucesso');
    return true;
  } catch (error) {
    logger.error('Erro ao atualizar configuração de webhook:', error);
    return false;
  }
};

/**
 * Verifica se o webhook está habilitado para o usuário
 */
export const isWebhookEnabled = async (userId?: string): Promise<boolean> => {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('Usuário não autenticado');
        return false;
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('configuracoes_integracoes')
      .select('webhook_enabled')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      logger.info('Configuração de webhook não encontrada, assumindo desabilitado');
      return false;
    }

    return !!data.webhook_enabled;
  } catch (error) {
    logger.error('Erro ao verificar se webhook está habilitado:', error);
    return false;
  }
};

/**
 * Obtém todas as configurações de webhook do usuário
 */
export const getWebhookSettings = async (): Promise<WebhookSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logger.error('Usuário não autenticado');
      return null;
    }

    const { data, error } = await supabase
      .from('configuracoes_integracoes')
      .select('webhook_url, webhook_enabled')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      logger.info('Configurações de webhook não encontradas');
      return null;
    }

    return {
      webhookUrl: data.webhook_url || '',
      enabled: !!data.webhook_enabled,
      events: ['cliente.created', 'cliente.updated', 'contrato.signed'],
    };
  } catch (error) {
    logger.error('Erro ao obter configurações de webhook:', error);
    return null;
  }
};

/**
 * Obtém a URL do webhook para o usuário
 */
export const getWebhookUrl = async (userId?: string): Promise<string | null> => {
  try {
    const config = await getWebhookConfig(userId);
    return config?.webhook_url || null;
  } catch (error) {
    logger.error('Erro ao obter URL do webhook:', error);
    return null;
  }
};

// Interface para dados do webhook
interface WebhookNotificationData {
  event: string;
  entity: string;
  entity_id: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Envia uma notificação para o webhook do usuário
 */
export const sendWebhookNotification = async (userId: string, data: WebhookNotificationData): Promise<boolean> => {
  try {
    const webhookUrl = await getWebhookUrl(userId);
    const isEnabled = await isWebhookEnabled(userId);
    
    if (!isEnabled || !webhookUrl) {
      logger.info('Webhook não habilitado ou URL não configurada');
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        timestamp: new Date().toISOString(),
        data
      })
    });

    if (response.ok) {
      logger.info('Webhook enviado com sucesso');
      return true;
    } else {
      logger.error('Erro ao enviar webhook:', response.statusText);
      return false;
    }
  } catch (error) {
    logger.error('Erro ao enviar notificação webhook:', error);
    return false;
  }
};
