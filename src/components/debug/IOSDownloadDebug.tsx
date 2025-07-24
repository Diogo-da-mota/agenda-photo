/**
 * Componente de debug para testar download de imagens em iOS
 * Usado apenas para desenvolvimento e testes
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Monitor, Info } from 'lucide-react';
import { deviceDetection } from '@/utils/deviceDetection';
import { downloadImageUniversal } from '@/utils/downloadImage';
import { toast } from 'sonner';

export const IOSDownloadDebug: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const deviceInfo = deviceDetection.getDeviceInfo();

  // URL de imagem de teste (placeholder)
  const testImageUrl = '/placeholder.svg';
  const testFileName = 'teste-download-ios.jpg';

  const handleTestDownload = async () => {
    setIsDownloading(true);
    
    try {
      await downloadImageUniversal(testImageUrl, {
        filename: testFileName,
        showInstructions: true,
        fallbackToNewTab: true
      });
    } catch (error) {
      console.error('Erro no teste de download:', error);
      toast.error('Erro no teste de download');
    } finally {
      setIsDownloading(false);
    }
  };

  const getDeviceIcon = () => {
    if (deviceInfo.isIOS) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceStatus = () => {
    if (deviceInfo.isIOS) {
      return <Badge variant="secondary">iOS Detectado</Badge>;
    }
    return <Badge variant="outline">Outro Dispositivo</Badge>;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getDeviceIcon()}
          Debug: Download iOS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações do Dispositivo */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informações do Dispositivo
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              {getDeviceStatus()}
            </div>
            <div className="flex justify-between">
              <span>iOS:</span>
              <Badge variant={deviceInfo.isIOS ? "default" : "outline"}>
                {deviceInfo.isIOS ? "Sim" : "Não"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Safari:</span>
              <Badge variant={deviceInfo.isSafari ? "default" : "outline"}>
                {deviceInfo.isSafari ? "Sim" : "Não"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Download Nativo:</span>
              <Badge variant={deviceInfo.supportsDownload ? "default" : "destructive"}>
                {deviceInfo.supportsDownload ? "Suportado" : "Não Suportado"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Share API:</span>
              <Badge variant={deviceInfo.supportsShare ? "default" : "outline"}>
                {deviceInfo.supportsShare ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Método de Download Detectado */}
        <div className="p-3 bg-muted rounded-lg">
          <h5 className="font-medium text-sm mb-1">Método de Download:</h5>
          <p className="text-sm text-muted-foreground">
            {deviceInfo.isIOS 
              ? "Canvas + toBlob() → Nova aba (iOS)" 
              : deviceInfo.supportsDownload 
                ? "Download attribute (Padrão)"
                : "Fallback method"
            }
          </p>
        </div>

        {/* Botão de Teste */}
        <Button 
          onClick={handleTestDownload}
          disabled={isDownloading}
          className="w-full"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Testando...' : 'Testar Download'}
        </Button>

        {/* Instruções para iOS */}
        {deviceInfo.isIOS && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-sm text-blue-800 mb-1">
              Instruções para iOS:
            </h5>
            <p className="text-xs text-blue-700">
              Após clicar em "Testar Download", uma nova aba será aberta. 
              Para salvar a imagem: toque e segure a imagem, depois selecione 
              "Salvar na Galeria de Fotos".
            </p>
          </div>
        )}

        {/* User Agent (para debug) */}
        <details className="text-xs">
          <summary className="cursor-pointer font-medium">User Agent</summary>
          <p className="mt-1 p-2 bg-muted rounded text-xs break-all">
            {navigator.userAgent}
          </p>
        </details>
      </CardContent>
    </Card>
  );
};