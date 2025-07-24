
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';

const SupabaseConnectionTester = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    status: 'idle' | 'success' | 'error';
    data?: any;
    error?: any;
    diagnostics: string[];
  }>({
    status: 'idle',
    diagnostics: []
  });

  const addDiagnostic = (message: string) => {
    setTestResults(prev => ({
      ...prev,
      diagnostics: [...prev.diagnostics, `${new Date().toISOString().slice(11, 19)} - ${message}`]
    }));
  };

  const testConnection = async () => {
    // Reset previous test results
    setTestResults({
      status: 'idle',
      diagnostics: []
    });
    setLoading(true);

    try {
      // Check authentication
      if (!user) {
        addDiagnostic("❌ Falha: Usuário não autenticado. Faça login antes de testar.");
        toast({
          title: "Teste falhou",
          description: "Usuário não autenticado. Faça login antes de testar.",
          variant: "destructive"
        });
        setTestResults(prev => ({ ...prev, status: 'error' }));
        setLoading(false);
        return;
      }

      addDiagnostic(`✅ Usuário autenticado: ${user.id}`);

      // Test connection with a simple query to an existing table
      addDiagnostic("🔄 Testando conexão com Supabase...");
      
      // Use 'clientes' table which exists in the schema
      const { data: pingData, error: pingError } = await supabase
        .from('clientes')
        .select('*')
        .limit(1);
      
      if (pingError) {
        addDiagnostic(`❌ Erro na conexão: ${pingError.message} (${pingError.code})`);
        throw new Error(`Conexão falhou: ${pingError.message}`);
      } else {
        addDiagnostic("✅ Conexão com Supabase estabelecida com sucesso");
      }

      // Prepare test client data
      const clienteData = {
        nome: "Cliente Teste Diagnóstico",
        email: `teste${Date.now()}@diagnostico.com`,
        telefone: "11999999999",
        empresa: "Empresa Diagnóstico",
        user_id: user.id
      };

      addDiagnostic(`🔄 Enviando cliente teste: ${JSON.stringify(clienteData, null, 2)}`);

      // Insert test client - use 'clientes' table
      const { data, error } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select();

      if (error) {
        addDiagnostic(`❌ Falha na inserção: ${error.message} (${error.code})`);
        addDiagnostic(`❌ Detalhes: ${JSON.stringify(error.details || {}, null, 2)}`);
        
        // Diagnostic suggestions based on common error codes
        if (error.code === "42P01") {
          addDiagnostic("📝 Diagnóstico: A tabela 'clientes' não existe no banco de dados.");
        } else if (error.code === "42501" || error.code === "42503") {
          addDiagnostic("📝 Diagnóstico: Problema com políticas de segurança (RLS). Verifique se as políticas permitem inserção.");
        } else if (error.code === "23505") {
          addDiagnostic("📝 Diagnóstico: Violação de chave única. Um registro com o mesmo valor já existe.");
        } else if (error.code === "23502") {
          addDiagnostic("📝 Diagnóstico: Violação de valor não nulo. Um campo obrigatório não foi preenchido.");
        }
        
        setTestResults(prev => ({ ...prev, status: 'error', error }));
        throw error;
      }

      addDiagnostic(`✅ Cliente teste inserido com sucesso!`);
      addDiagnostic(`📄 Dados retornados: ${JSON.stringify(data, null, 2)}`);
      
      setTestResults(prev => ({ ...prev, status: 'success', data }));
      
      toast({
        title: "Teste concluído",
        description: "Cliente teste inserido com sucesso!",
      });
    } catch (error) {
      console.error("Erro detalhado:", error);
      
      toast({
        title: "Teste falhou",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      
      // Final diagnosis suggestion
      addDiagnostic("🔍 POSSÍVEIS SOLUÇÕES:");
      addDiagnostic("1. Verifique se a tabela 'clientes' existe no banco de dados");
      addDiagnostic("2. Verifique se as políticas de segurança (RLS) permitem inserção");
      addDiagnostic("3. Confirme que sua conexão com o Supabase está correta");
      addDiagnostic("4. Verifique se o usuário está autenticado corretamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Teste de Conexão Supabase
        </CardTitle>
        <CardDescription>
          Este teste verifica a capacidade de salvar dados no Supabase e gera um relatório detalhado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando conexão...
            </>
          ) : (
            <>
              Testar Conexão e Criar Cliente Fictício
            </>
          )}
        </Button>

        {testResults.diagnostics.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center">
                {testResults.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : testResults.status === 'error' ? (
                  <XCircle className="h-5 w-5 mr-2 text-red-500" />
                ) : (
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                )}
                Relatório de Diagnóstico
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="bg-black/95 text-white p-3 rounded-md overflow-auto max-h-96">
                <pre className="text-xs whitespace-pre-wrap">
                  {testResults.diagnostics.map((line, i) => (
                    <div key={i} className="py-0.5">{line}</div>
                  ))}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTester;
