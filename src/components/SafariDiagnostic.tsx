import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { hybridStorage } from '@/utils/storageUtils';

interface StorageInfo {
  strategy: 'localStorage' | 'cookies';
  isSafari: boolean;
  isPrivateMode: boolean;
  localStorageAvailable: boolean;
  userAgent: string;
}

const SafariDiagnostic: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar apenas para Safari ou quando há problemas de armazenamento
    const info = hybridStorage.getStorageInfo();
    setStorageInfo(info);
    
    // Mostrar se for Safari ou se localStorage não estiver disponível
    if (info.isSafari || !info.localStorageAvailable) {
      setIsVisible(true);
    }
  }, []);

  const runStorageTest = () => {
    try {
      const testKey = '__safari_diagnostic_test__';
      const testValue = JSON.stringify({
        timestamp: Date.now(),
        test: 'safari_diagnostic'
      });
      
      // Testar armazenamento
      hybridStorage.setItem(testKey, testValue);
      const retrieved = hybridStorage.getItem(testKey);
      hybridStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        setTestResult({
          success: true,
          message: 'Armazenamento funcionando corretamente!'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Problema detectado: dados não foram armazenados corretamente.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };

  if (!isVisible || !storageInfo) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          Diagnóstico de Armazenamento Safari
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Informações sobre o armazenamento de dados no seu navegador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200">Informações do Navegador</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Safari:</span>
                <Badge variant={storageInfo.isSafari ? 'destructive' : 'secondary'}>
                  {storageInfo.isSafari ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>localStorage:</span>
                <Badge variant={storageInfo.localStorageAvailable ? 'default' : 'destructive'}>
                  {storageInfo.localStorageAvailable ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Estratégia:</span>
                <Badge variant={storageInfo.strategy === 'localStorage' ? 'default' : 'secondary'}>
                  {storageInfo.strategy === 'localStorage' ? 'localStorage' : 'Cookies'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200">Teste de Armazenamento</h4>
            <Button 
              onClick={runStorageTest}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Testar Armazenamento
            </Button>
            {testResult && (
              <div className={`flex items-center gap-2 text-sm p-2 rounded ${
                testResult.success 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Alertas e Instruções */}
        {storageInfo.isSafari && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Safari Detectado:</strong> Se você está enfrentando problemas com dados não sendo salvos, 
              isso pode estar relacionado às configurações de privacidade do Safari.
            </AlertDescription>
          </Alert>
        )}

        {storageInfo.strategy === 'cookies' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Usando Cookies:</strong> O sistema está usando cookies para armazenar dados devido a 
              limitações do localStorage. Certifique-se de que os cookies estão habilitados.
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções para Safari */}
        {storageInfo.isSafari && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Configurações Recomendadas para Safari
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>Abra as <strong>Preferências do Safari</strong></li>
              <li>Vá para a aba <strong>Privacidade</strong></li>
              <li>Em "Cookies e dados de websites", selecione <strong>"Sempre permitir"</strong></li>
              <li>Reinicie o Safari e faça login novamente</li>
            </ol>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Isso permitirá que o localStorage funcione corretamente e seus dados sejam mantidos entre sessões.
            </p>
          </div>
        )}

        {/* Botão para ocultar */}
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="text-orange-600 hover:text-orange-800"
          >
            Ocultar Diagnóstico
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafariDiagnostic;