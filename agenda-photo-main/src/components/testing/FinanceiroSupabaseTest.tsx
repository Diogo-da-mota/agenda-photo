import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { criarTransacao, Transacao } from '@/services/financeiroService';

/**
 * Componente para testar a persistência de dados financeiros no Supabase
 */
const FinanceiroSupabaseTest: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    logs: string[];
  }>({
    status: 'idle',
    message: '',
    logs: []
  });

  // Adicionar uma mensagem aos logs
  const addLog = (message: string) => {
    setResults(prev => ({
      ...prev,
      logs: [...prev.logs, message]
    }));
  };

  // Função para testar o salvamento de dados financeiros
  const runTest = async () => {
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "É necessário estar logado para executar este teste.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults({
      status: 'idle',
      message: '',
      logs: ["Iniciando teste de persistência de dados financeiros..."]
    });

    try {
      // 1. Criar uma transação de teste
      addLog("1. Criando transação de teste...");
      
      const novaTransacao: Omit<Transacao, 'id' | 'criado_em' | 'atualizado_em'> = {
        descricao: "TESTE - Pagamento de Ensaio Fotográfico",
        clienteName: "Cliente Teste",
        valor: 1500,
        tipo: 'receita',
        status: 'recebido',
        data_transacao: new Date().toISOString().split('T')[0],
        data_evento: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        categoria: "Ensaio",
        forma_pagamento: "PIX",
        observacoes: "Esta é uma transação de teste para verificar a persistência de dados.",
        user_id: user.id,
        cliente_id: null
      };
      
      addLog(`Dados da transação: ${JSON.stringify({
        descricao: novaTransacao.descricao,
        valor: novaTransacao.valor,
        tipo: novaTransacao.tipo,
        status: novaTransacao.status,
      })}`);
      
      // 2. Salvar no Supabase
      addLog("2. Salvando transação no Supabase...");
      const transacaoSalva = await criarTransacao(novaTransacao, user.id);
      addLog(`✅ Transação criada com ID: ${transacaoSalva.id}`);
      
      // 3. Verificar se os dados foram salvos corretamente
      addLog("3. Verificando dados salvos...");
      const success = await verificarSalvamentoDados(transacaoSalva, user.id);
      
      if (success) {
        addLog("4. Excluindo transação de teste...");
        // 4. Limpar dados de teste após verificação bem-sucedida
        await supabase
          .from('financeiro_transacoes')
          .delete()
          .eq('id', transacaoSalva.id);
        
        addLog("✅ Transação de teste excluída com sucesso.");
        
        setResults(prev => ({
          ...prev,
          status: 'success',
          message: "Teste concluído com sucesso! Os dados financeiros estão sendo salvos corretamente no Supabase."
        }));

      } else {
        throw new Error("Falha na verificação dos dados salvos.");
      }
    } catch (error) {
      // Erro no teste - log removido para produção
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Ocorreu um erro desconhecido durante o teste.";
      
      setResults(prev => ({
        ...prev,
        status: 'error',
        message: `Falha no teste: ${errorMessage}`
      }));
      
      toast({
        title: "Erro no teste",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para verificar se os dados foram salvos corretamente
  const verificarSalvamentoDados = async (transacaoSalva: Transacao, userId: string): Promise<boolean> => {
    try {
      // Verificar se a transação foi salva corretamente
      const { data, error } = await supabase
        .from('financeiro_transacoes')
        .select('*')
        .eq('id', transacaoSalva.id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        addLog(`❌ Erro ao verificar transação salva: ${error.message}`);
        return false;
      }
      
      // Usar tipagem 'any' para acessar as propriedades que podem não estar na definição de tipos
      const transacaoData = data as any;
      
      addLog(`✅ Verificação concluída: ${transacaoData.descricao} - R$ ${transacaoData.valor}`);
      addLog(`Tipo: ${transacaoData.tipo}, Status: ${transacaoData.status}`);
      
      // Verificar se os campos principais foram salvos corretamente
      const verificacoes = [
        { campo: 'descricao', esperado: transacaoSalva.descricao, atual: transacaoData.descricao },
        { campo: 'valor', esperado: transacaoSalva.valor, atual: parseFloat(transacaoData.valor) },
        { campo: 'tipo', esperado: transacaoSalva.tipo, atual: transacaoData.tipo },
        { campo: 'status', esperado: transacaoSalva.status, atual: transacaoData.status },
        { campo: 'user_id', esperado: userId, atual: transacaoData.user_id },
      ];
      
      let todosCorretos = true;
      
      verificacoes.forEach(v => {
        const correto = v.esperado === v.atual;
        addLog(`Campo ${v.campo}: ${correto ? '✅' : '❌'} ${correto ? 'Correto' : `Esperado: ${v.esperado}, Atual: ${v.atual}`}`);
        
        if (!correto) {
          todosCorretos = false;
        }
      });
      
      return todosCorretos;
    } catch (error) {
      addLog(`❌ Erro ao verificar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teste de Persistência - Financeiro</CardTitle>
        <CardDescription>
          Verifica se os dados do módulo Financeiro estão sendo salvos corretamente no Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runTest} 
            disabled={loading || !user}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              'Executar Teste'
            )}
          </Button>
          
          {results.status !== 'idle' && (
            <div className={`p-4 border rounded-md ${
              results.status === 'success' ? 'bg-green-50 border-green-200' : 
              results.status === 'error' ? 'bg-red-50 border-red-200' : ''
            }`}>
              <div className="flex items-center mb-2">
                {results.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : results.status === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                ) : null}
                <span className={`font-medium ${
                  results.status === 'success' ? 'text-green-700' : 
                  results.status === 'error' ? 'text-red-700' : ''
                }`}>
                  {results.message}
                </span>
              </div>
              
              <div className="bg-black/5 p-3 rounded-md mt-2 max-h-60 overflow-y-auto font-mono text-sm">
                {results.logs.map((log, index) => (
                  <div key={index} className="mb-1 whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceiroSupabaseTest;