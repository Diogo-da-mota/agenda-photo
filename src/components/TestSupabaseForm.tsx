
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  testarEnvioSupabase, 
  testarEnvioFormulario,
  gerarRelatorio,
  obterHistoricoTestes,
  limparHistoricoTestes
} from '@/utils/testarEnvioSupabase';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Terminal, ClipboardList, Trash, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const TestSupabaseForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [customData, setCustomData] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [tabValue, setTabValue] = useState('resultado');
  const [relatorio, setRelatorio] = useState<any>(null);

  const handleTestDefaultData = async () => {
    setLoading(true);
    setShowResponse(true);
    setTabValue('resultado');
    try {
      const response = await testarEnvioSupabase();
      setResult(response);
      console.log('Test results:', response);
      
      if (response.success) {
        toast({
          title: "Teste concluído com sucesso",
          description: "Os dados padrão foram enviados para o Supabase",
        });
      } else {
        toast({
          title: "Erro no teste",
          description: `Falha ao enviar dados: ${response.error?.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in test:', error);
      setResult({ success: false, error });
      toast({
        title: "Erro no teste",
        description: "Ocorreu um erro ao realizar o teste",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestCustomData = async () => {
    setLoading(true);
    setShowResponse(true);
    setTabValue('resultado');
    try {
      // Parse the custom data from the textarea
      let customDataObj;
      try {
        customDataObj = JSON.parse(customData);
      } catch (e) {
        setResult({ success: false, error: 'Formato JSON inválido. Verifique os dados inseridos.' });
        toast({
          title: "Formato JSON inválido",
          description: "Verifique os dados inseridos e tente novamente",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await testarEnvioFormulario(customDataObj);
      setResult(response);
      
      if (response.success) {
        toast({
          title: "Teste concluído com sucesso",
          description: "Os dados personalizados foram enviados para o Supabase",
        });
      } else {
        toast({
          title: "Erro no teste",
          description: `Falha ao enviar dados: ${response.error?.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in test:', error);
      setResult({ success: false, error });
      toast({
        title: "Erro no teste",
        description: "Ocorreu um erro ao realizar o teste",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setShowResponse(false);
    setResult(null);
  };
  
  const handleGerarRelatorio = () => {
    const reportData = gerarRelatorio();
    setRelatorio(reportData);
    setTabValue('relatorio');
    
    toast({
      title: "Relatório gerado",
      description: `Taxa de sucesso: ${reportData.estatisticas.taxaSucesso}`,
    });
  };
  
  const handleLimparHistorico = () => {
    limparHistoricoTestes();
    setRelatorio(null);
    toast({
      title: "Histórico limpo",
      description: "O histórico de testes foi limpo com sucesso",
    });
  };

  const formatarDataHora = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('pt-BR');
    } catch (e) {
      return isoString;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Teste de Envio para Supabase</CardTitle>
        <p className="text-sm text-gray-500">
          Use esta ferramenta para testar o envio de dados para a tabela mensagens_de_contato
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Teste com Dados Padrão</h3>
          <p className="text-sm text-gray-500">
            Envia um conjunto de dados padrão para testar a conexão com o Supabase
          </p>
          <Button 
            onClick={handleTestDefaultData} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Enviando...' : 'Testar com Dados Padrão'}
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Teste com Dados Personalizados</h3>
          <p className="text-sm text-gray-500">
            Insira seus próprios dados no formato JSON para testar
          </p>
          <div className="space-y-2">
            <Label htmlFor="customData">Dados personalizados (formato JSON)</Label>
            <Textarea 
              id="customData"
              placeholder='{"nome": "Nome Teste", "e_mail": "email@teste.com", "telefone": "123456789", "mensagem": "Mensagem de teste"}'
              className="min-h-32"
              value={customData}
              onChange={(e) => setCustomData(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Exemplo: {"{"}"nome": "Nome Teste", "e_mail": "email@teste.com", "telefone": "123456789", "mensagem": "Mensagem de teste"{"}"}
            </p>
          </div>
          <Button 
            onClick={handleTestCustomData} 
            disabled={loading || !customData.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? 'Enviando...' : 'Testar com Dados Personalizados'}
          </Button>
        </div>

        {showResponse && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGerarRelatorio}
                    className="flex items-center gap-1"
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden sm:inline">Gerar Relatório</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLimparHistorico}
                    className="flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpar Histórico</span>
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearResults}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Limpar resultados</span>
                </Button>
              </div>
              
              <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="resultado">Resultado</TabsTrigger>
                  <TabsTrigger value="relatorio">Relatório</TabsTrigger>
                </TabsList>
                
                <TabsContent value="resultado" className="mt-4">
                  {result && (
                    <Alert variant={result.success ? "default" : "destructive"}>
                      {result.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {result.success ? "Sucesso!" : "Erro!"}
                      </AlertTitle>
                      <AlertDescription>
                        {result.success 
                          ? "Dados enviados com sucesso para o Supabase." 
                          : `Erro ao enviar dados: ${result.error?.message || JSON.stringify(result.error)}`
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <h4 className="text-sm font-medium mb-2">Resposta Completa:</h4>
                    <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="relatorio" className="mt-4">
                  {relatorio ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Card className="p-3">
                          <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
                          <p className="text-2xl font-bold mt-2">{relatorio.estatisticas.totalTestes}</p>
                        </Card>
                        <Card className="p-3">
                          <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
                          <p className="text-2xl font-bold text-green-600 mt-2">{relatorio.estatisticas.sucessos}</p>
                        </Card>
                        <Card className="p-3">
                          <CardTitle className="text-sm font-medium">Falhas</CardTitle>
                          <p className="text-2xl font-bold text-red-600 mt-2">{relatorio.estatisticas.falhas}</p>
                        </Card>
                        <Card className="p-3">
                          <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                          <p className="text-2xl font-bold mt-2">{relatorio.estatisticas.taxaSucesso}</p>
                        </Card>
                      </div>
                      
                      {relatorio.ultimosErros.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Últimos Erros:</h4>
                          <div className="space-y-2">
                            {relatorio.ultimosErros.map((erro: any, index: number) => (
                              <Alert key={index} variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle className="flex items-center justify-between">
                                  <span>Erro em {formatarDataHora(erro.timestamp)}</span>
                                </AlertTitle>
                                <AlertDescription>
                                  <p>{erro.mensagem}</p>
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Histórico Completo:</h4>
                        <div className="space-y-2 max-h-60 overflow-auto p-2 bg-gray-50 rounded">
                          {relatorio.historicoCompleto.map((log: any, index: number) => (
                            <div key={index} className="text-xs p-2 bg-white rounded border">
                              <div className="flex justify-between items-center mb-1">
                                <Badge variant={log.tipo === 'erro' ? 'destructive' : log.tipo === 'resposta' ? 'outline' : 'secondary'}>
                                  {log.tipo.toUpperCase()}
                                </Badge>
                                <span className="text-gray-500">{formatarDataHora(log.timestamp)}</span>
                              </div>
                              {log.mensagem && <p className="font-medium">{log.mensagem}</p>}
                              <pre className="text-xs overflow-auto mt-1 bg-gray-50 p-1 rounded">
                                {JSON.stringify(log.dados, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Gere um relatório para ver estatísticas e histórico.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <p>Esta ferramenta é apenas para testes e não afeta o formulário original.</p>
      </CardFooter>
    </Card>
  );
};

export default TestSupabaseForm;
