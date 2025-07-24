import React from 'react';
import { File, Download, FileText, FileImage, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Attachment {
  name: string;
  size: string;
  type?: string;
  url?: string;
}

interface ContractAttachmentsProps {
  attachments: Attachment[];
}

const ContractAttachments = ({ attachments }: ContractAttachmentsProps) => {
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewAttachment, setPreviewAttachment] = React.useState<Attachment | null>(null);
  
  const handleDownload = (attachment: Attachment) => {
    // Simula a geração de um PDF simples com texto
    const texto = `PDF gerado via MCP context7: ${attachment.name}\n\nEste é apenas um texto de exemplo.`;
    const blob = new Blob([texto], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = attachment.name.endsWith(".pdf") ? attachment.name : `${attachment.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download iniciado",
      description: `O arquivo ${attachment.name} está sendo baixado.`,
    });
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
      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo disponível</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
              <div className="flex items-center gap-3">
                {getFileIcon(attachment.name)}
                <div>
                  <span className="text-sm font-medium">{attachment.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">({attachment.size})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPreviewable(attachment.name) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handlePreview(attachment)}
                    className="gap-1"
                  >
                    <Eye size={14} />
                    <span className="hidden sm:inline">Visualizar</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  className="gap-1"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Baixar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewAttachment?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewAttachment && (
              <>
                {previewAttachment.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="h-[500px] w-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Visualização de PDF não disponível. Por favor, faça o download.</p>
                  </div>
                ) : (
                  <img 
                    src={previewAttachment.url || `https://placehold.co/600x400?text=${encodeURIComponent(previewAttachment.name)}`} 
                    alt={previewAttachment.name}
                    className="max-w-full max-h-[500px] mx-auto object-contain"
                  />
                )}
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => handleDownload(previewAttachment)} 
                    className="gap-1"
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
