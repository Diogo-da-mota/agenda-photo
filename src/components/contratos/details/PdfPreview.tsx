import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Download, Eye, ZoomIn, ZoomOut, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface PdfPreviewProps {
  pdfUrl?: string;
  fileName?: string;
  showPreview?: boolean;
  className?: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ 
  pdfUrl, 
  fileName = "Contrato.pdf",
  showPreview = true,
  className = ""
}) => {
  const { toast } = useToast();
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [zoom, setZoom] = useState(100);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);
  const maxRetries = 3;

  // Debug logging function
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🔍 PDF Debug:', logMessage);
    setDebugInfo(prev => [...prev, logMessage]);
  };

  const handleIframeLoad = useCallback(() => {
    addDebugLog('✅ Iframe carregado com sucesso');
    setIsLoading(false);
    setError(null);
    setErrorMessage('');
    setRetryCount(0);
  }, []);

  const handleIframeError = useCallback((error?: string) => {
    const errorMsg = error || 'Erro ao carregar PDF';
    addDebugLog(`❌ Erro ao carregar iframe: ${errorMsg}`);
    setIsLoading(false);
    setError('Falha ao carregar o PDF no iframe');
    setErrorMessage(errorMsg);
    
    if (retryCount < maxRetries) {
      setTimeout(() => {
        addDebugLog(`🔄 Tentativa ${retryCount + 1} de ${maxRetries}`);
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        setError(null);
        // Forçar reload do iframe
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      }, 1000 * (retryCount + 1)); // Delay progressivo
    }
  }, [retryCount, maxRetries]);

  // Função para verificar se o PDF pode ser carregado
  const validatePdfUrl = async (url: string): Promise<boolean> => {
    try {
      console.log('🔍 PDF Preview Debug: Validando URL do PDF', url);
      
      // Verificar se a URL é válida
      if (!url || !url.startsWith('blob:')) {
        console.error('❌ PDF Preview Debug: URL inválida ou não é blob', url);
        return false;
      }

      // Tentar fazer fetch do blob para verificar se é válido
      const response = await fetch(url);
      if (!response.ok) {
        console.error('❌ PDF Preview Debug: Resposta não OK', response.status, response.statusText);
        return false;
      }

      const blob = await response.blob();
      console.log('🔍 PDF Preview Debug: Blob validado', {
        size: blob.size,
        type: blob.type,
        isValidSize: blob.size > 0,
        isValidType: blob.type === 'application/pdf'
      });

      if (blob.size === 0) {
        console.error('❌ PDF Preview Debug: Blob está vazio');
        return false;
      }

      if (blob.type !== 'application/pdf') {
        console.error('❌ PDF Preview Debug: Tipo de arquivo inválido', blob.type);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ PDF Preview Debug: Erro na validação da URL', error);
      return false;
    }
  };

  // Função para gerar diferentes formatos de URL para teste
  const generatePdfUrlVariants = (baseUrl: string): string[] => {
    const variants = [
      baseUrl, // URL original
      `${baseUrl}#toolbar=0&navpanes=0&scrollbar=0`, // Sem parâmetros de zoom
      `${baseUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=FitH`, // Com zoom FitH
      `${baseUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=FitV`, // Com zoom FitV
      `${baseUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=100`, // Com zoom 100%
      `${baseUrl}#view=FitH`, // Apenas view FitH
      `${baseUrl}#page=1&zoom=85`, // Página 1 com zoom 85%
    ];
    
    console.log('🔍 PDF Preview Debug: Variantes de URL geradas', variants);
    return variants;
  };

  // Função para testar carregamento com diferentes URLs
  const testPdfUrlVariants = async (baseUrl: string): Promise<string | null> => {
    const variants = generatePdfUrlVariants(baseUrl);
    
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      console.log(`🔍 PDF Preview Debug: Testando variante ${i + 1}/${variants.length}:`, variant);
      
      try {
        // Simular teste de carregamento
        const testFrame = document.createElement('iframe');
        testFrame.style.display = 'none';
        testFrame.src = variant;
        
        const loadPromise = new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => {
            console.log(`⏰ PDF Preview Debug: Timeout na variante ${i + 1}`);
            resolve(false);
          }, 3000);
          
          testFrame.onload = () => {
            console.log(`✅ PDF Preview Debug: Variante ${i + 1} carregou com sucesso`);
            clearTimeout(timeout);
            resolve(true);
          };
          
          testFrame.onerror = () => {
            console.log(`❌ PDF Preview Debug: Erro na variante ${i + 1}`);
            clearTimeout(timeout);
            resolve(false);
          };
        });
        
        document.body.appendChild(testFrame);
        const success = await loadPromise;
        document.body.removeChild(testFrame);
        
        if (success) {
          console.log(`🎯 PDF Preview Debug: Variante funcional encontrada: ${variant}`);
          return variant;
        }
      } catch (error) {
        console.error(`❌ PDF Preview Debug: Erro ao testar variante ${i + 1}:`, error);
      }
    }
    
    console.error('❌ PDF Preview Debug: Nenhuma variante de URL funcionou');
    return null;
  };

  // Log PDF URL changes
React.useEffect(() => {
    console.log('📄 PDF Preview Debug: useEffect executado', {
      pdfUrl,
      hasPdfUrl: !!pdfUrl,
      urlLength: pdfUrl?.length || 0
    });

    // Adicionar listener para violações de CSP
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      console.error('🚨 PDF Preview Debug: Violação de CSP detectada!', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        disposition: event.disposition
      });
      
      if (event.blockedURI?.includes('blob:')) {
        console.error('🚨 PDF Preview Debug: CSP está bloqueando blob URLs!');
        setError('Política de segurança está bloqueando o carregamento do PDF');
      }
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };

    // Validar URL quando ela mudar
    if (pdfUrl) {
      validatePdfUrl(pdfUrl).then(async isValid => {
        if (!isValid) {
          console.error('❌ PDF Preview Debug: Validação inicial da URL falhou, testando variantes...');
          
          // Tentar diferentes variantes de URL
          const workingUrl = await testPdfUrlVariants(pdfUrl);
          
          if (workingUrl) {
            console.log('🎯 PDF Preview Debug: Variante funcional encontrada, atualizando URL');
            // Aqui poderíamos atualizar a URL, mas por enquanto apenas logamos
            setError(null);
          } else {
            setError('PDF inválido ou corrompido - nenhuma variante funcionou');
            console.error('❌ PDF Preview Debug: Todas as variantes falharam');
          }
        } else {
          console.log('✅ PDF Preview Debug: URL validada com sucesso');
          setError(null);
        }
      });
      
      addDebugLog(`PDF URL recebida: ${pdfUrl}`);
      addDebugLog(`PDF URL tipo: ${typeof pdfUrl}`);
      addDebugLog(`PDF URL length: ${pdfUrl.length}`);
      
      // Verificar se é um blob URL válido
      if (pdfUrl.startsWith('blob:')) {
        addDebugLog('✅ URL é um blob válido');
        
        // Testar se o blob ainda existe
        fetch(pdfUrl)
          .then(response => {
            addDebugLog(`✅ Blob acessível - Status: ${response.status}`);
            addDebugLog(`✅ Blob Content-Type: ${response.headers.get('content-type') || 'não definido'}`);
            return response.blob();
          })
          .then(blob => {
            addDebugLog(`✅ Blob size: ${blob.size} bytes`);
            addDebugLog(`✅ Blob type: ${blob.type}`);
          })
          .catch(error => {
            addDebugLog(`❌ Erro ao acessar blob: ${error.message}`);
          });
      } else {
        addDebugLog('⚠️ URL não é um blob');
      }
    } else {
      addDebugLog('❌ PDF URL é null/undefined');
    }
  }, [pdfUrl]);

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar timeouts e recursos
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
      if (modalIframeRef.current) {
        modalIframeRef.current.src = 'about:blank';
      }
    };
  }, []);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullViewOpen) {
        setIsFullViewOpen(false);
      }
    };

    if (isFullViewOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFullViewOpen]);

  // Se não há URL do PDF, não renderiza nada
  if (!pdfUrl || !showPreview) {
    return null;
  }

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Fazer download do PDF
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      // Criar link temporário para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: `O arquivo ${fileName} está sendo baixado.`,
      });
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullView = useCallback(() => {
    addDebugLog('🎯 handleFullView chamado');
    addDebugLog(`🎯 pdfUrl no momento do clique: ${pdfUrl}`);
    addDebugLog(`🎯 isFullViewOpen atual: ${isFullViewOpen}`);
    
    if (!pdfUrl) {
      addDebugLog('❌ Tentativa de abrir PDF sem URL válida');
      toast({
        title: "Erro",
        description: "URL do PDF não está disponível. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
      return;
    }
    
    // Usar setTimeout para evitar problemas de renderização
    setTimeout(() => {
      setIsFullViewOpen(true);
      addDebugLog('✅ Modal definido para abrir');
    }, 0);
  }, [pdfUrl, isFullViewOpen, toast]);

  return (
    <>
      <Card className={`mb-8 ${className} max-w-md`}>
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <span className="font-medium text-sm">Contrato</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullView}
                className="h-7 w-7 p-0"
                title="Visualizar em tela cheia"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={isLoading}
                className="h-7 w-7 p-0"
                title="Baixar PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Visualização Expandida do PDF */}
          <div className="relative bg-gray-50 rounded-lg overflow-hidden border shadow-sm">
            <div className="w-full h-64 overflow-hidden">
              {error ? (
                <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600">
                  <div className="text-center p-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-sm font-medium mb-2">Erro ao carregar PDF</p>
                    <p className="text-xs opacity-75 mb-3">{error}</p>
                    {errorMessage && (
                      <p className="text-xs text-gray-500 mb-3">{errorMessage}</p>
                    )}
                    {retryCount < maxRetries && (
                      <p className="text-xs text-blue-600 mb-2">
                        Tentativa {retryCount} de {maxRetries}...
                      </p>
                    )}
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setRetryCount(0);
                          setError(null);
                          setIsLoading(true);
                          if (iframeRef.current) {
                            iframeRef.current.src = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=FitH`;
                          }
                        }}
                        className="text-xs"
                      >
                        Tentar novamente
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(pdfUrl, '_blank')}
                        className="text-xs"
                      >
                        Abrir em nova aba
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=FitH`}
                  className="w-full h-full border-0"
                  title={`Preview de ${fileName}`}
                  style={{ 
                    pointerEvents: 'none',
                    overflow: 'hidden'
                  }}
                  onLoad={handleIframeLoad}
                  onError={() => handleIframeError('Erro no carregamento do iframe')}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </div>
            
            {/* Overlay para capturar cliques */}
            <div 
              className="absolute inset-0 bg-transparent cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-center"
              onClick={handleFullView}
            >
              <div className="bg-white/90 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4 text-gray-700" />
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground truncate">{fileName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Visualização Completa */}
      <Dialog open={isFullViewOpen} onOpenChange={setIsFullViewOpen}>
        <DialogContent className="max-w-6xl h-[95vh] p-0">
          <DialogHeader className="p-4 pb-3 border-b bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                <FileText className="h-5 w-5 text-red-600" />
                <span className="text-gray-900 font-medium">{fileName}</span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Visualização completa do arquivo PDF {fileName}
              </DialogDescription>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullViewOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 p-2">
            <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-inner">
              {error ? (
                <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Erro ao carregar PDF</p>
                    <p className="text-sm opacity-75 mb-4">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Tentar Download
                    </Button>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={modalIframeRef}
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title={fileName}
                  style={{ minHeight: 'calc(95vh - 80px)' }}
                  onLoad={() => {
                    addDebugLog('✅ Iframe modal carregado com sucesso');
                    toast({
                      title: "PDF Carregado",
                      description: "O PDF foi carregado com sucesso no modal.",
                    });
                  }}
                  onError={(e) => {
                    addDebugLog(`❌ Erro no iframe modal: ${e}`);
                    toast({
                      title: "Erro no PDF",
                      description: "Erro ao carregar o PDF no modal. Verifique o console.",
                      variant: "destructive",
                    });
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfPreview;