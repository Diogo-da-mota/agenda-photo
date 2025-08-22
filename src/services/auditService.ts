import { supabase } from '@/lib/supabase';

export interface AuditLog {
  id: string;
  table_name: string;
  operation: string;
  old_data?: any;
  new_data?: any;
  user_id?: string;
  timestamp: string;
}

export const auditService = {
  async logActivity(
    tableName: string,
    operation: string,
    recordId?: string,
    oldData?: any,
    newData?: any
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use sistema_atividades table instead of audit_logs
      const { error } = await supabase
        .from('sistema_atividades')
        .insert({
          table_name: tableName,
          operation,
          record_id: recordId,
          old_data: oldData,
          new_data: newData,
          user_id: user?.id
        });

      if (error) {
        console.error('Erro ao registrar atividade de auditoria:', error);
      }
    } catch (error) {
      console.error('Erro no auditService.logActivity:', error);
    }
  },

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      // Use sistema_atividades table instead of audit_logs
      const { data, error } = await supabase
        .from('sistema_atividades')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        table_name: item.table_name,
        operation: item.operation,
        old_data: item.old_data,
        new_data: item.new_data,
        user_id: item.user_id,
        timestamp: item.timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      return [];
    }
  },

  async getActivityForRecord(tableName: string, recordId: string): Promise<AuditLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      // Use sistema_atividades table instead of audit_logs
      const { data, error } = await supabase
        .from('sistema_atividades')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao buscar atividade do registro:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        table_name: item.table_name,
        operation: item.operation,
        old_data: item.old_data,
        new_data: item.new_data,
        user_id: item.user_id,
        timestamp: item.timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar atividade do registro:', error);
      return [];
    }
  }
};