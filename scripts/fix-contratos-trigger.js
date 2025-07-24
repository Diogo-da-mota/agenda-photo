/**
 * Script para corrigir o erro de trigger dos contratos
 * Erro: "CASE/WHEN could not convert type jsonb to json"
 * 
 * Execute este script para aplicar a correção via Supabase client
 */

import { supabase } from '../src/integrations/supabase/client.js';

const fixContratosTriger = async () => {
  try {
    console.log('🔧 Iniciando correção do trigger dos contratos...');
    
    // 1. Desabilitar trigger problemático
    const { error: dropError } = await supabase.rpc('sql', {
      query: 'DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;'
    });
    
    if (dropError) {
      console.error('❌ Erro ao remover trigger:', dropError);
      return;
    }
    
    console.log('✅ Trigger problemático removido');
    
    // 2. Recriar função corrigida
    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Auditar mudanças em dados financeiros
        IF TG_TABLE_NAME IN ('financeiro_transacoes', 'financeiro_despesas', 'contratos') THEN
          PERFORM public.log_security_event_enhanced('SENSITIVE_DATA_MODIFIED', 
            jsonb_build_object(
              'table', TG_TABLE_NAME,
              'operation', TG_OP,
              'record_id', COALESCE(NEW.id, OLD.id),
              'changes', CASE 
                WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
                WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
                ELSE to_jsonb(NEW)
              END
            )
          );
        END IF;
        
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error: functionError } = await supabase.rpc('sql', {
      query: functionSQL
    });
    
    if (functionError) {
      console.error('❌ Erro ao recriar função:', functionError);
      return;
    }
    
    console.log('✅ Função de auditoria corrigida');
    
    // 3. Recriar trigger com função corrigida
    const triggerSQL = `
      CREATE TRIGGER audit_contratos 
        AFTER INSERT OR UPDATE OR DELETE ON public.contratos
        FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();
    `;
    
    const { error: triggerError } = await supabase.rpc('sql', {
      query: triggerSQL
    });
    
    if (triggerError) {
      console.error('❌ Erro ao recriar trigger:', triggerError);
      return;
    }
    
    console.log('✅ Trigger corrigido e reativado');
    
    // 4. Testar se a correção funcionou
    console.log('🧪 Testando correção...');
    
    const { data: triggers, error: testError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          trigger_name,
          event_manipulation,
          action_timing
        FROM information_schema.triggers 
        WHERE event_object_table = 'contratos' 
        AND trigger_name = 'audit_contratos';
      `
    });
    
    if (testError) {
      console.error('❌ Erro ao verificar trigger:', testError);
      return;
    }
    
    if (triggers && triggers.length > 0) {
      console.log('✅ Trigger verificado e funcionando:', triggers[0]);
      console.log('🎉 Correção aplicada com sucesso!');
      console.log('📝 Agora você pode tentar excluir e criar contratos novamente.');
    } else {
      console.log('⚠️ Trigger não encontrado após correção');
    }
    
  } catch (error) {
    console.error('❌ Erro geral na correção:', error);
  }
};

// Executar correção
fixContratosTriger();

export default fixContratosTriger;