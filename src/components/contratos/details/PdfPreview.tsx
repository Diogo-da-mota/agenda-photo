import React, { useState } from 'react';
import { FileText, Download, Eye, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  const handleFullView = () => {
    setIsFullViewOpen(true);
  };

  return (
    <>
      <Card className={`mb-8 ${className} max-w-xs`}>
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
            <div className="w-full h-22 overflow-hidden">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=FitH`}
                className="w-full h-full border-0"
                title={`Preview de ${fileName}`}
                style={{ 
                  pointerEvents: 'none',
                  overflow: 'hidden'
                }}
              />
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
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={fileName}
                style={{ minHeight: 'calc(95vh - 80px)' }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfPreview;