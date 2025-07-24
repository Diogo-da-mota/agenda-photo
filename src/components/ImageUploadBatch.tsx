
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageItem } from './image-batch/types';
import UploadList from './image-batch/UploadList';
import BatchProgress from './image-batch/BatchProgress';
import ActionButtons from './image-batch/ActionButtons';
import { formatFileSize, createImageItem } from './image-batch/utils';

const ImageUploadBatch: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    uploadMultipleImages, 
    isUploading, 
    isBatchProcessing, 
    batchProgress, 
    statusMessage, 
    cancelUpload
  } = useImageUpload({
    onBatchComplete: (results) => {
      console.log('Batch upload complete:', results);
      toast({
        title: "Uploads concluídos",
        description: `${results.filter(r => r.success).length} de ${results.length} imagens foram enviadas com sucesso.`
      });
    }
  });

  // Função para manipular a seleção de arquivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Criar items com preview para cada arquivo
    const newItems: ImageItem[] = files.map(file => createImageItem(file));
    
    setSelectedFiles(prev => [...prev, ...newItems]);
    
    // Limpar input para permitir selecionar os mesmos arquivos novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Imagens selecionadas",
      description: `${files.length} imagens adicionadas à fila de upload.`
    });
  };

  // Remover um item da fila
  const removeItem = (id: string) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter(item => item.id !== id);
      return newFiles;
    });
  };

  // Limpar toda a fila
  const clearQueue = () => {
    setSelectedFiles([]);
    toast({
      title: "Fila limpa",
      description: "Todos os itens foram removidos da fila de upload."
    });
  };

  // Processar upload em lote
  const processQueue = async () => {
    if (!selectedFiles.length || isBatchProcessing) return;
    
    // Marcar todos como 'processing'
    setSelectedFiles(prev => 
      prev.map(item => ({
        ...item,
        status: 'processing'
      }))
    );
    
    // Extrair apenas os arquivos
    const files = selectedFiles.map(item => item.file);
    
    try {
      // Iniciar upload em lote
      const results = await uploadMultipleImages(files);
      
      // Atualizar status de cada item baseado no resultado
      setSelectedFiles(prev => {
        return prev.map((item, index) => {
          const result = results[index];
          return {
            ...item,
            status: result?.success ? 'success' : 'error',
            error: result?.error?.message,
            url: result?.url || ''
          };
        });
      });
      
      const successCount = results.filter(r => r.success).length;
      
      toast({
        title: "Processamento concluído",
        description: `${successCount} de ${files.length} imagens foram processadas com sucesso.`
      });
      
    } catch (error) {
      console.error('Erro no processamento em lote:', error);
      
      // Marcar itens que ainda estão "processing" como "error"
      setSelectedFiles(prev => 
        prev.map(item => ({
          ...item,
          status: item.status === 'processing' ? 'error' : item.status,
          error: item.status === 'processing' ? 'Processo interrompido' : item.error
        }))
      );
      
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro inesperado durante o processamento em lote",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload em Lote</CardTitle>
        <CardDescription>
          Selecione múltiplas imagens para upload simultâneo com monitoramento em tempo real
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Botões de ação */}
        <ActionButtons
          onSelectClick={() => fileInputRef.current?.click()}
          onProcessClick={processQueue}
          onCancelClick={cancelUpload}
          onClearClick={clearQueue}
          isProcessing={isBatchProcessing}
          hasFiles={selectedFiles.length > 0}
          fileInputRef={fileInputRef}
        />
        
        {/* Status de processamento em lote */}
        <BatchProgress
          isProcessing={isBatchProcessing}
          statusMessage={statusMessage}
          batchProgress={batchProgress}
        />
        
        {/* Lista de arquivos */}
        <UploadList
          files={selectedFiles}
          onRemoveItem={removeItem}
          isProcessing={isBatchProcessing}
          formatFileSize={formatFileSize}
        />
        
        {/* Input file escondido para seleção de arquivos */}
        <input 
          type="file" 
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          disabled={isBatchProcessing}
        />
      </CardContent>
    </Card>
  );
};

export default ImageUploadBatch;
