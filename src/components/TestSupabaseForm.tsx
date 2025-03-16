
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { testarEnvioSupabase, testarEnvioFormulario } from '@/utils/testarEnvioSupabase';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const TestSupabaseForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [customData, setCustomData] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const handleTestDefaultData = async () => {
    setLoading(true);
    setShowResponse(true);
    try {
      const response = await testarEnvioSupabase();
      setResult(response);
      console.log('Test results:', response);
    } catch (error) {
      console.error('Error in test:', error);
      setResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  const handleTestCustomData = async () => {
    setLoading(true);
    setShowResponse(true);
    try {
      // Parse the custom data from the textarea
      let customDataObj;
      try {
        customDataObj = JSON.parse(customData);
      } catch (e) {
        setResult({ success: false, error: 'Formato JSON inválido. Verifique os dados inseridos.' });
        setLoading(false);
        return;
      }

      const response = await testarEnvioFormulario(customDataObj);
      setResult(response);
    } catch (error) {
      console.error('Error in test:', error);
      setResult({ success: false, error });
    } finally {
      setLoading(false);
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
          >
            {loading ? 'Enviando...' : 'Testar com Dados Personalizados'}
          </Button>
        </div>

        {showResponse && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-medium flex items-center">
                <Terminal className="mr-2 h-4 w-4" />
                Resultado do Teste
              </h3>
              
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
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Resposta Completa:</h4>
                <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
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
