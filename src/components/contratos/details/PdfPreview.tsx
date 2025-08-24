import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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



  return (
    <>
      <Card className={`mb-8 ${className} w-44`}>

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
                onClick={handleDownload}
                disabled={isLoading}
                className="h-7 w-7 p-0"
                title="Baixar PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Ícone de PDF estilizado como folha A4 */}
          <div className="relative bg-white rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm mx-auto" style={{ width: '76px', height: '132px' }}>
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
              {/* Ícone de documento */}
              <FileText className="h-8 w-8 text-red-600 mb-2" />
              
              {/* Linhas simulando texto */}
              <div className="space-y-1 w-12">
                <div className="h-0.5 bg-gray-300 rounded"></div>
                <div className="h-0.5 bg-gray-300 rounded w-10"></div>
                <div className="h-0.5 bg-gray-300 rounded w-8"></div>
                <div className="h-0.5 bg-gray-300 rounded w-11"></div>
              </div>
              
              {/* Indicador PDF */}
              <div className="absolute bottom-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded font-bold">
                PDF
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground truncate">{fileName}</p>
          </div>
        </CardContent>
      </Card>


    </>
  );
};

export default PdfPreview;