
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type LogEntry = {
  message: string;
  type: 'info' | 'error' | 'success';
};

export const useSupabaseDiagnostic = (user: User | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs(prev => [...prev, { message, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testSupabaseSave = async () => {
    clearLogs();
    setLoading(true);

    if (!user) {
      addLog("❌ Usuário não autenticado. Impossível realizar teste.", "error");
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    addLog(`ℹ️ Usuário autenticado: ${user.id}`, "info");

    const payload = {
      nome: "Diagnóstico",
      email: `diagnostico${Date.now()}@teste.com`,
      telefone: "0000000000",
      empresa: "Teste Debug",
      user_id: user.id
    };

    addLog(`🔄 Enviando payload: ${JSON.stringify(payload, null, 2)}`, "info");

    try {
      addLog("🔍 Verificando se a tabela existe...", "info");
      
      const { error: tableError } = await supabase
        .from('clientes')
        .select('count')
        .limit(1);
      
      if (tableError) {
        addLog(`❌ Erro ao verificar tabela: ${tableError.message} (${tableError.code})`, "error");
        throw new Error(`Tabela não encontrada: ${tableError.message}`);
      }
      
      addLog("✅ Tabela encontrada", "success");
      
      addLog("🔍 Testando políticas RLS...", "info");
      
      const { data: policyTest, error: policyError } = await supabase
        .from('clientes')
        .select('*')
        .limit(5);
      
      if (policyError) {
        addLog(`⚠️ Possível problema com RLS: ${policyError.message}`, "error");
      } else {
        addLog(`✅ Acesso à tabela confirmado (${policyTest?.length || 0} registros encontrados)`, "success");
      }
      
      addLog("🔄 Enviando dados para Supabase...", "info");
      
      const { data, error, status, statusText } = await supabase
        .from('clientes')
        .insert([payload])
        .select();

      addLog(`📊 Status da resposta: ${status} ${statusText || ''}`, "info");

      if (error) {
        addLog(`❌ Erro ao salvar: ${error.message} (${error.code})`, "error");
        
        if (error.code === "42501") {
          addLog(`📝 Problema com políticas RLS. Verifique se existe política para INSERT.`, "error");
          addLog(`💡 Execute este SQL:

CREATE POLICY "Usuários podem inserir seus próprios dados" 
ON clientes FOR INSERT 
WITH CHECK (auth.uid() = user_id);`, "info");
        } else if (error.code === "23505") {
          addLog(`📝 Erro de chave duplicada. Email ou outro valor único já existe.`, "error");
        } else if (error.code === "23502") {
          addLog(`📝 Campo obrigatório não preenchido: ${error.details}`, "error");
        }
        
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        addLog(`✅ Cliente salvo com sucesso!`, "success");
        addLog(`📄 Dados retornados: ${JSON.stringify(data, null, 2)}`, "success");
        
        toast({
          title: "Sucesso",
          description: "Cliente salvo com sucesso no Supabase!",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Exceção: ${errorMessage}`, "error");
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    logs,
    testSupabaseSave,
  };
};
