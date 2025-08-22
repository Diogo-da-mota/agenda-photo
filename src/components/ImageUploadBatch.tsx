import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadBatchProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
  acceptedFormats?: string[];
}

const ImageUploadBatch: React.FC<ImageUploadBatchProps> = ({
  onImagesSelected,
  maxImages = 50,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      acceptedFormats.includes(file.type)
    );

    if (validFiles.length !== acceptedFiles.length) {
      toast({
        title: 'Alguns arquivos foram ignorados',
        description: 'Apenas imagens JPEG, PNG e WebP são aceitas.',
        variant: 'destructive',
      });
    }

    if (selectedFiles.length + validFiles.length > maxImages) {
      toast({
        title: 'Limite excedido',
        description: `Você pode selecionar no máximo ${maxImages} imagens.`,
        variant: 'destructive',
      });
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onImagesSelected(newFiles);
  }, [selectedFiles, maxImages, acceptedFormats, onImagesSelected, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats.map(format => format.split('/')[1])
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onImagesSelected(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    onImagesSelected([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Upload de Imagens em Lote
        </CardTitle>
        <CardDescription>
          Selecione múltiplas imagens para upload (máximo {maxImages})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p>Solte as imagens aqui...</p>
          ) : (
            <div>
              <p className="text-lg font-medium">
                Arraste imagens aqui ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Formatos aceitos: JPEG, PNG, WebP
              </p>
            </div>
          )}
        </div>

        {selectedFiles.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium">
                {selectedFiles.length} arquivo(s) selecionado(s)
              </p>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Limpar Tudo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="text-xs text-center mt-1 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadBatch;