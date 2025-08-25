
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const TestFictitiousClient = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [clientName, setClientName] = useState(`Cliente Teste ${new Date().toLocaleString()}`);
  const [clientEmail, setClientEmail] = useState(`teste${Date.now()}@cliente.com`);

  const addDiagnostic = (message: string) => {
    // Log removido para produção
    setDiagnostics(prev => [...prev, message]);
  };

  const clearDiagnostics = () => {
    setDiagnostics([]);
    setResult(null);
  };

  const verifyTable = async () => {
    try {
      addDiagnostic("🔍 Verificando estrutura da tabela clientes...");
      const { data, error, count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        addDiagnostic(`❌ Erro ao verificar tabela: ${error.message} (${error.code})`);
        return false;
      }
      
      addDiagnostic(`✅ Tabela clientes existe! Contagem de registros: ${count || 0}`);
      return true;
    } catch (error) {
      addDiagnostic(`❌ Erro ao verificar tabela: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    }
  };

  const handleTestInsertion = async () => {
    clearDiagnostics();
    setLoading(true);

    addDiagnostic(`🔍 Iniciando teste de inserção às ${new Date().toLocaleTimeString()}`);
    
    if (!user) {
      addDiagnostic("❌ Erro: Você precisa estar logado para realizar esse teste.");
      toast({
        title: "❌ Você precisa estar logado para realizar esse teste.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    addDiagnostic(`✅ Usuário autenticado: ${user.id}`);

    const tableExists = await verifyTable();
    if (!tableExists) {
      addDiagnostic("❌ Verifique se a tabela clientes existe no seu banco de dados");
      setLoading(false);
      return;
    }

    try {
      addDiagnostic("🔄 Verificando conexão com Supabase...");
      const { error: pingError } = await supabase.from('clientes').select('count').limit(1);
      
      if (pingError) {
        addDiagnostic(`❌ Erro na conexão: ${pingError.message} (${pingError.code})`);
        throw new Error(`Conexão falhou: ${pingError.message}`);
      } 
      
      addDiagnostic("✅ Conexão com Supabase estabelecida com sucesso");

      const clientData = {
        nome: clientName,
        email: clientEmail,
        telefone: "62999999999",
        empresa: "Empresa de Teste",
        user_id: user.id
      };

      addDiagnostic(`🔄 Preparando dados para inserção: ${JSON.stringify(clientData, null, 2)}`);
      addDiagnostic("🔄 Verificando políticas de segurança (RLS)...");
      addDiagnostic("🔄 Enviando dados para a tabela clientes com log completo...");
      
      const { data, error, status, statusText } = await supabase
        .from('clientes')
        .insert(clientData)
        .select();

      addDiagnostic(`📊 Status da resposta: ${status} ${statusText}`);

      if (error) {
        addDiagnostic(`❌ Erro na inserção: ${error.message} (${error.code})`);
        if (error.details) {
          addDiagnostic(`📌 Detalhes do erro: ${error.details}`);
        }
        
        if (error.code === "23503") {
          addDiagnostic("📝 Diagnóstico: Violação de chave estrangeira. Verifique se o user_id está válido.");
        } else if (error.code === "23505") {
          addDiagnostic("📝 Diagnóstico: Violação de chave única. Um registro com o mesmo valor já existe.");
        } else if (error.code === "42501") {
          addDiagnostic("📝 Diagnóstico: Problema com políticas de segurança (RLS). Verifique se as políticas permitem inserção.");
          addDiagnostic("📝 Solução: Adicione uma política RLS para INSERT na tabela clientes:");
          addDiagnostic(`
CREATE POLICY "Usuários podem inserir seus próprios clientes" ON clientes
FOR INSERT WITH CHECK (auth.uid() = user_id);`);
        } else if (error.code === "23502") {
          addDiagnostic("📝 Diagnóstico: Violação de valor não nulo. Um campo obrigatório não foi preenchido.");
        } else if (error.code === "PGRST301") {
          addDiagnostic("📝 Diagnóstico: Token JWT expirado. Faça login novamente.");
        }
        
        throw error;
      }

      addDiagnostic(`✅ Cliente fictício salvo com sucesso! ID: ${data?.[0]?.id || 'N/A'}`);
      addDiagnostic(`✅ Dados retornados do Supabase: ${JSON.stringify(data, null, 2)}`);

      setResult({
        success: true,
        data: data,
        error: null
      });
    } catch (error) {
      addDiagnostic(`❌ Falha na operação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      toast({
        title: "❌ Erro ao tentar salvar o cliente no Supabase.",
        variant: "destructive"
      });
      
      setResult({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      addDiagnostic("🔍 POSSÍVEIS SOLUÇÕES:");
      addDiagnostic("1. Verifique se a tabela 'clientes' existe no banco de dados e possui todos os campos necessários");
      addDiagnostic("2. Confirme que o usuário está autenticado com um token válido");
      addDiagnostic("3. Verifique se existem políticas RLS (Row Level Security) configuradas corretamente na tabela");
      addDiagnostic("4. Execute este SQL no Editor SQL do Supabase:");
      addDiagnostic(`
-- Habilitar RLS na tabela clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Adicionar política que permite aos usuários inserir seus próprios dados
CREATE POLICY "Usuários podem inserir seus próprios dados" ON public.clientes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Adicionar política que permite aos usuários ver seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.clientes 
FOR SELECT USING (auth.uid() = user_id);
`);
    } finally {
      setLoading(false);
      addDiagnostic(`🏁 Teste concluído às ${new Date().toLocaleTimeString()}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do cliente teste</label>
          <Input 
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email do cliente teste</label>
          <Input 
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleTestInsertion} 
        disabled={loading}
        className="gap-2 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Testando Inserção...
          </>
        ) : (
          <>
            🔘 🧪 Testar Inserção de Cliente Fictício
          </>
        )}
      </Button>
      
      {diagnostics.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              🔍 Diagnóstico de Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/95 text-white p-3 rounded overflow-auto max-h-96 text-xs">
              {diagnostics.map((line, i) => (
                <div key={i} className="py-0.5">{line}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <Card className={result.success ? "border-green-200" : "border-red-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              📊 Relatório da Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm font-medium">
                Status: {result.success ? 
                  <span className="text-green-600">✅ Sucesso</span> : 
                  <span className="text-red-600">❌ Falha</span>
                }
              </div>
              
              {result.error && (
                <div className="text-sm p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-medium text-red-800">Mensagem de erro:</p>
                  <p className="text-red-700">{result.error}</p>
                </div>
              )}
              
              {result.data && (
                <div className="space-y-2">
                  <p className="font-medium">Dados inseridos:</p>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestFictitiousClient;
