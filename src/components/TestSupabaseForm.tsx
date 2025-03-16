import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { testarEnvioSupabase, testarEnvioFormulario, testarEnvioComApiKeys, obterHistoricoTestes, limparHistoricoTestes, gerarRelatorio } from '@/utils/testarEnvioSupabase';

interface TestResult {
  success: boolean;
  data?: any;
  error?: any;
  timestamp: string;
}

const TestSupabaseForm = () => {
  const [formData, setFormData] = useState({
    nome: "Teste Lovable",
    e_mail: "teste@lovable.com",
    telefone: "999999999",
    mensagem: "Teste de envio pelo site",
  });
  const [customData, setCustomData] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomData(e.target.value);
  };

  const handleTestWithDefaultData = async () => {
    setIsLoading(true);
    setShowResult(false);

    try {
      const result = await testarEnvioSupabase();
      setTestResult(result);
      setShowResult(true);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Teste com dados padrão completado com sucesso.",
        });
      } else {
        toast({
          title: "Falha no teste",
          description: "O teste com dados padrão falhou. Veja os detalhes abaixo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao executar teste:', error);
      setTestResult({
        success: false,
        error,
        timestamp: new Date().toISOString()
      });
      setShowResult(true);

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao testar com dados padrão.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWithCustomData = async () => {
    setIsLoading(true);
    setShowResult(false);

    try {
      const parsedData = JSON.parse(customData);
      const result = await testarEnvioFormulario(parsedData);
      setTestResult(result);
      setShowResult(true);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Teste com dados personalizados completado com sucesso.",
        });
      } else {
        toast({
          title: "Falha no teste",
          description: "O teste com dados personalizados falhou. Veja os detalhes abaixo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao executar teste com dados personalizados:', error);
      setTestResult({
        success: false,
        error,
        timestamp: new Date().toISOString()
      });
      setShowResult(true);

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao testar com dados personalizados. Verifique o formato JSON.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestWithApiKeys = async () => {
    setIsLoading(true);
    setShowResult(false);
    
    try {
      const result = await testarEnvioComApiKeys();
      setTestResult(result);
      setShowResult(true);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Teste com API Keys completado com sucesso.",
        });
      } else {
        toast({
          title: "Falha no teste",
          description: "O teste com API Keys falhou. Veja os detalhes abaixo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao executar teste com API Keys:', error);
      setTestResult({ 
        success: false, 
        error, 
        timestamp: new Date().toISOString() 
      });
      setShowResult(true);
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao testar com API Keys.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowReport = () => {
    const report = gerarRelatorio();
    console.log('Relatório de Testes:', report);
    alert(JSON.stringify(report, null, 2));
  };

  const handleClearHistory = () => {
    const result = limparHistoricoTestes();
    if (result.success) {
      toast({
        title: "Histórico Limpo",
        description: "O histórico de testes foi limpo com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao Limpar",
        description: "Não foi possível limpar o histórico de testes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Dados Padrão para Teste</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use estes campos para modificar os dados padrão que serão enviados para o Supabase.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
            <Input
              type="text"
              name="nome"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="e_mail" className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              name="e_mail"
              id="e_mail"
              value={formData.e_mail}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label>
            <Input
              type="text"
              name="telefone"
              id="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700">Mensagem</label>
            <Textarea
              name="mensagem"
              id="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Testar com Dados Padrão</h3>
        <p className="text-sm text-gray-600 mb-4">
          Envia os dados preenchidos acima para o Supabase.
        </p>
        <Button
          variant="outline"
          onClick={handleTestWithDefaultData}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Enviando...' : 'Testar com Dados Padrão'}
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Testar com Dados Personalizados (JSON)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Insira um objeto JSON para enviar dados personalizados para o Supabase.
        </p>
        <Textarea
          placeholder='Ex: { "nome": "Teste JSON", "email": "json@example.com", "telefone": "123456789", "mensagem": "Teste JSON" }'
          value={customData}
          onChange={handleCustomDataChange}
          className="min-h-32"
        />
        <Button
          variant="outline"
          onClick={handleTestWithCustomData}
          disabled={isLoading}
          className="w-full mt-2"
        >
          {isLoading ? 'Enviando...' : 'Testar com Dados Personalizados'}
        </Button>
      </div>
      
      {/* Add a new button for testing with API keys */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Testar com API Keys Explícitas</h3>
        <p className="text-sm text-gray-600 mb-4">
          Este método usa fetch API com as chaves API diretamente, similar ao script PowerShell.
        </p>
        <Button 
          variant="outline" 
          onClick={handleTestWithApiKeys}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Enviando...' : 'Testar com API Keys Explícitas'}
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Ações</h3>
        <Button variant="secondary" onClick={handleShowReport} className="w-full mb-2">
          Gerar Relatório
        </Button>
        <Button variant="destructive" onClick={handleClearHistory} className="w-full">
          Limpar Histórico
        </Button>
      </div>

      {showResult && testResult && (
        <div className="mt-8 p-4 border rounded-md">
          <h4 className="font-medium mb-2">Resultado do Teste</h4>
          {testResult.success ? (
            <div className="text-green-600">
              ✅ Sucesso! Dados enviados para o Supabase.
              {testResult.data && (
                <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Falha! Erro ao enviar para o Supabase.
              {testResult.error && (
                <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-auto">
                  {JSON.stringify(testResult.error, null, 2)}
                </pre>
              )}
            </div>
          )}
          <p className="text-gray-500 mt-2">Timestamp: {testResult.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default TestSupabaseForm;
