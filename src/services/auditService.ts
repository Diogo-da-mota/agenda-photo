
import { supabase } from '@/lib/supabase';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  timestamp: string;
}

export const auditService = {
  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    try {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.log('Criando log de auditoria:', log);
      }
      const { data, error } = await supabase.from('audit_logs').insert(log).select('id');
      if (error) {
        // Log apenas em desenvolvimento
        if (import.meta.env.MODE === 'development') {
          console.error('Erro ao criar log de auditoria:', error);
        }
        throw error;
      }
      return { success: true, id: data && data[0] ? data[0].id : null };
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
      return { success: false, error };
    }
  },

  async getAuditLogs(userId: string, limit = 50) {
    try {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.log('Buscando logs de auditoria para usuário:', userId);
      }
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        // Log apenas em desenvolvimento
        if (import.meta.env.MODE === 'development') {
          console.error('Erro ao buscar logs de auditoria:', error);
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      return [];
    }
  },

  async getTableAuditLogs(tableName: string, recordId: string) {
    try {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.log('Buscando logs de auditoria para tabela:', tableName, 'registro:', recordId);
      }
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId);

      if (error) {
        // Log apenas em desenvolvimento
        if (import.meta.env.MODE === 'development') {
          console.error('Erro ao buscar logs de auditoria da tabela:', error);
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria da tabela:', error);
      return [];
    }
  }
};
