import React from 'react';
import { File, Download, FileText, FileImage, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PdfPreview from './PdfPreview';

interface Attachment {
  name: string;
  size: string;
  type?: string;
  url?: string;
}

interface ContractData {
  id?: string;
  nome_cliente?: string;
  pdfUrl?: string;
  [key: string]: any;
}

interface ContractAttachmentsProps {
  attachments: Attachment[];
  contractData?: ContractData;
  onRemoveAttachment?: (index: number) => void;
  showRemoveButton?: boolean;
}

const ContractAttachments = ({ 
  attachments, 
  contractData,
  onRemoveAttachment, 
  showRemoveButton = false 
}: ContractAttachmentsProps) => {
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewAttachment, setPreviewAttachment] = React.useState<Attachment | null>(null);
  
  const handleDownload = async (attachment: Attachment) => {
    // Validar se a URL existe
    if (!attachment.url) {
      toast({
        title: "Erro no download",
        description: "URL do arquivo não encontrada.",
        variant: "destructive",
      });
      return;
    }

    // Validar se a URL é válida
    try {
      new URL(attachment.url);
    } catch {
      toast({
        title: "Erro no download",
        description: "URL do arquivo é inválida.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mostrar toast de início do download
      toast({
        title: "Download iniciado",
        description: `Baixando ${attachment.name}...`,
      });

      // Fazer fetch do arquivo real do Supabase Storage
      const response = await fetch(attachment.url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      // Obter o blob do arquivo
      const blob = await response.blob();
      
      // Verificar se o blob tem conteúdo
      if (blob.size === 0) {
        throw new Error('Arquivo vazio ou corrompido');
      }
      
      // Detectar tipo MIME do arquivo se não estiver definido
      let mimeType = attachment.type || blob.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        const extension = attachment.name.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'pdf':
            mimeType = 'application/pdf';
            break;
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          case 'doc':
            mimeType = 'application/msword';
            break;
          case 'docx':
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          default:
            mimeType = 'application/octet-stream';
        }
      }
      
      // Criar blob com tipo MIME correto
      const typedBlob = new Blob([blob], { type: mimeType });
      
      // Criar URL temporária para download
      const url = URL.createObjectURL(typedBlob);
      
      // Criar elemento de download
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpar URL temporária após um pequeno delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Download concluído",
        description: `O arquivo ${attachment.name} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro no download",
        description: `Falha ao baixar ${attachment.name}: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };
  
  const handlePreview = (attachment: Attachment) => {
    // Only preview for image or pdf types
    const extension = attachment.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(extension || '')) {
      setPreviewAttachment(attachment);
      setPreviewOpen(true);
    } else {
      toast({
        title: "Visualização não disponível",
        description: "Este tipo de arquivo não pode ser visualizado diretamente. Faça o download para visualizá-lo.",
      });
    }
  };
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <File size={16} className="text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage size={16} className="text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileText size={16} className="text-blue-700" />;
      default:
        return <File size={16} />;
    }
  };

  const isPreviewable = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(extension || '');
  };

  return (
    <div>
      <h3 className="font-medium mb-4">Anexos</h3>
      
      {/* Card de Visualização do PDF do Contrato */}
      {contractData?.pdfUrl && (
        <div className="mb-6">
          <PdfPreview
            pdfUrl={contractData.pdfUrl}
            fileName={`Contrato - ${contractData.nome_cliente || 'Cliente'}.pdf`}
            showPreview={true}
            className="w-full max-w-none"
          />
        </div>
      )}
      
      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo adicional disponível</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/30 p-3 rounded-md gap-3 sm:gap-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {getFileIcon(attachment.name)}
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium block truncate">{attachment.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">({attachment.size})</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isPreviewable(attachment.name) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handlePreview(attachment)}
                    className="gap-1 flex-1 sm:flex-initial"
                  >
                    <Eye size={14} />
                    <span className="sm:hidden">Ver</span>
                    <span className="hidden sm:inline">Visualizar</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  className="gap-1 flex-1 sm:flex-initial"
                >
                  <Download size={14} />
                  <span className="sm:hidden">Baixar</span>
                  <span className="hidden sm:inline">Baixar</span>
                </Button>
                {showRemoveButton && onRemoveAttachment && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveAttachment(index)}
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-initial"
                  >
                    <X size={14} />
                    <span className="sm:hidden">Remover</span>
                    <span className="hidden sm:inline">Remover</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg truncate pr-8">{previewAttachment?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewAttachment && (
              <>
                {previewAttachment.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="h-[150px] sm:h-[250px] w-full bg-muted flex items-center justify-center rounded-md">
                    <p className="text-muted-foreground text-center px-4">Visualização de PDF não disponível. Por favor, faça o download.</p>
                  </div>
                ) : (
                  <img 
                    src={previewAttachment.url || `https://placehold.co/600x400?text=${encodeURIComponent(previewAttachment.name)}`} 
                    alt={previewAttachment.name}
                    className="max-w-full max-h-[150px] sm:max-h-[250px] mx-auto object-contain rounded-md"
                  />
                )}
                <div className="mt-4 flex justify-center sm:justify-end">
                  <Button 
                    onClick={() => handleDownload(previewAttachment)} 
                    className="gap-1 w-full sm:w-auto"
                  >
                    <Download size={16} />
                    Baixar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractAttachments;
