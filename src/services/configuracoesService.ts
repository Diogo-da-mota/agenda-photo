
import { supabase } from '@/lib/supabase';

export interface ConfiguracoesApp {
  id: string;
  id_usuario: string;
  nome_empresa?: string;
  logo_url?: string;
  cores_tema?: any;
  configuracoes_notificacao?: any;
  criado_em: string;
  atualizado_em: string;
}

export const configuracoesService = {
  async getConfiguracoes(userId: string): Promise<ConfiguracoesApp | null> {
    try {
      console.log('Buscando configurações para usuário:', userId);
      
      // Mock configuration data
      return {
        id: `config-${userId}`,
        id_usuario: userId,
        nome_empresa: 'Empresa Mock',
        logo_url: '',
        cores_tema: {},
        configuracoes_notificacao: {},
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  },

  async updateConfiguracoes(userId: string, configuracoes: Partial<ConfiguracoesApp>): Promise<boolean> {
    try {
      console.log('Atualizando configurações para usuário:', userId, configuracoes);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return false;
    }
  },

  async createConfiguracoes(userId: string, configuracoes: Partial<ConfiguracoesApp>): Promise<ConfiguracoesApp | null> {
    try {
      console.log('Criando configurações para usuário:', userId, configuracoes);
      
      return {
        id: `config-${userId}`,
        id_usuario: userId,
        nome_empresa: configuracoes.nome_empresa || '',
        logo_url: configuracoes.logo_url || '',
        cores_tema: configuracoes.cores_tema || {},
        configuracoes_notificacao: configuracoes.configuracoes_notificacao || {},
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao criar configurações:', error);
      return null;
    }
  }
};
