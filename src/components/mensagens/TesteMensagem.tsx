import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testarRenderizacaoMensagem } from '@/services/mensagemService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TesteMensagem: React.FC = () => {
  const [resultadoTeste1, setResultadoTeste1] = useState<string>('');
  const [resultadoTeste2, setResultadoTeste2] = useState<string>('');
  const [resultadoTeste3, setResultadoTeste3] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Exemplo com \n (formato incorreto)
  const mensagemTesteIncorreta = `Olá {{nome_cliente}}!\n\nConfirmamos o recebimento do seu pagamento! \u2705\n\n\u{1F4CB} Detalhes do pagamento:\n\u{1F4B0} Valor: R$ {{valor_entrada}}\n\u{1F4C5} Data: {{data_atual}}\n\u{1F4CB} Referente: {{titulo_evento}}\n\u{1F9FE} Comprovante: #{{data_atual}}\n\nObrigado pela confiança!\n\n{{nome_empresa}}\n{{telefone_empresa}}`;

  // Exemplo com quebras de linha reais (formato correto)
  const mensagemTesteCorreta = `Olá {nome_cliente}!

Confirmamos o recebimento do seu pagamento! \u2705

\u{1F4CB} Detalhes do pagamento:
\u{1F4B0} Valor: R$ {valor_entrada}
\u{1F4C5} Data: {data_atual}
\u{1F4CB} Referente: {titulo_evento}
\u{1F9FE} Comprovante: {data_atual}

Obrigado pela confiança!

{nome_empresa}
{telefone_empresa}`;

  // Exemplo com chaves duplas sem \n (para teste de conversão)
  const mensagemTesteChavesDuplas = `Olá {{nome_cliente}}!

Confirmamos o recebimento do seu pagamento! \u2705

\u{1F4CB} Detalhes do pagamento:
\u{1F4B0} Valor: R$ {{valor_entrada}}
\u{1F4C5} Data: {{data_atual}}
\u{1F4CB} Referente: {{titulo_evento}}
\u{1F9FE} Comprovante: {{data_atual}}

Obrigado pela confiança!

{{nome_empresa}}
{{telefone_empresa}}`;

  const executarTesteIncorreto = async () => {
    try {
      setLoading(true);
      const resultado = await testarRenderizacaoMensagem(mensagemTesteIncorreta);
      setResultadoTeste1(resultado);
    } catch (error) {
      console.error("Erro ao testar mensagem:", error);
      setResultadoTeste1("Erro ao processar a mensagem");
    } finally {
      setLoading(false);
    }
  };

  const executarTesteCorreto = async () => {
    try {
      setLoading(true);
      const resultado = await testarRenderizacaoMensagem(mensagemTesteCorreta);
      setResultadoTeste2(resultado);
    } catch (error) {
      console.error("Erro ao testar mensagem:", error);
      setResultadoTeste2("Erro ao processar a mensagem");
    } finally {
      setLoading(false);
    }
  };

  const executarTesteChavesDuplas = async () => {
    try {
      setLoading(true);
      const resultado = await testarRenderizacaoMensagem(mensagemTesteChavesDuplas);
      setResultadoTeste3(resultado);
    } catch (error) {
      console.error("Erro ao testar mensagem:", error);
      setResultadoTeste3("Erro ao processar a mensagem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Teste de Renderização de Mensagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="formato-incorreto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formato-incorreto">Formato com \n</TabsTrigger>
            <TabsTrigger value="formato-correto">Formato Correto</TabsTrigger>
            <TabsTrigger value="chaves-duplas">Chaves Duplas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formato-incorreto" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Mensagem Original (com \n):</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {mensagemTesteIncorreta}
              </pre>
            </div>
            
            <Button 
              onClick={executarTesteIncorreto}
              disabled={loading}
            >
              {loading ? "Processando..." : "Executar Teste"}
            </Button>
            
            {resultadoTeste1 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Resultado da Renderização:</h3>
                <div className="whitespace-pre-wrap border p-3 rounded bg-white">
                  {resultadoTeste1}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="formato-correto" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Mensagem Original (formato correto):</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {mensagemTesteCorreta}
              </pre>
            </div>
            
            <Button 
              onClick={executarTesteCorreto}
              disabled={loading}
            >
              {loading ? "Processando..." : "Executar Teste"}
            </Button>
            
            {resultadoTeste2 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Resultado da Renderização:</h3>
                <div className="whitespace-pre-wrap border p-3 rounded bg-white">
                  {resultadoTeste2}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chaves-duplas" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Mensagem com Chaves Duplas:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {mensagemTesteChavesDuplas}
              </pre>
            </div>
            
            <Button 
              onClick={executarTesteChavesDuplas}
              disabled={loading}
            >
              {loading ? "Processando..." : "Executar Teste"}
            </Button>
            
            {resultadoTeste3 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Resultado da Renderização:</h3>
                <div className="whitespace-pre-wrap border p-3 rounded bg-white">
                  {resultadoTeste3}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};