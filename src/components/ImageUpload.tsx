import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { salvarMetadadosImagem } from '@/services/image';
import { useSupabaseStorageUpload } from '@/hooks/useSupabaseStorageUpload';
import { useAuth } from '@/hooks/useAuth';
import ImagePreview from './image-upload/ImagePreview';
import UploadError from './image-upload/UploadError';
import UploadProgress from './image-upload/UploadProgress';
import { validateFile } from './image-upload/FileValidator';

interface ImageUploadProps {
  onUploadComplete?: (url: string, id: string) => void;
  produtoId?: string;
  maxSize?: number; // in MB
  className?: string;
  buttonText?: string;
  allowedTypes?: string[];
  showPreview?: boolean;
  requiresAuth?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  produtoId,
  maxSize = 10, // Default 10MB
  className = '',
  buttonText = 'Fazer Upload de Imagem',
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showPreview = true,
  requiresAuth = true
}) => {
  const { uploadFiles, status } = useSupabaseStorageUpload({
    storageOptions: { bucket: 'imagens' }
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateFile({ file, maxSize, allowedTypes });
    if (!validation.isValid) {
      e.target.value = '';
      setError(validation.error);
      toast({
        title: "Erro de validação",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setError(null);
      
      if (showPreview) {
        const getPreviewUrl = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        const previewUrl = await getPreviewUrl;
        setPreview(previewUrl);
      }
      
      console.log('Starting Supabase upload process for file:', file.name);
      
      const pathPrefix = `ImagensGerais/${user?.id || 'sem-usuario'}`;
      const response = await uploadFiles([file], { pathPrefix });

      if (!response || !response.success || !response.urls?.[0]) {
        const errorMessage = response?.errors?.[0]?.error || 'Falha no upload para o Supabase Storage';
        throw new Error(errorMessage);
      }
      
      const imageUrl = response.urls[0];
      console.log('Upload to Supabase completed. URL:', imageUrl);

      // Salvar metadados no nosso banco de dados
      const metadataResult = await salvarMetadadosImagem(imageUrl, file.name, file.size, file.type);
      if (!metadataResult.success) {
        throw new Error('Falha ao salvar os metadados da imagem no banco de dados.');
      }

      if (onUploadComplete && metadataResult.imageId) {
        onUploadComplete(imageUrl, metadataResult.imageId);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Error in image upload component:', errorMessage);
      setError(errorMessage);
      setPreview(null);
      
      toast({
        title: "Erro no upload",
        description: `Ocorreu um erro ao tentar fazer o upload da imagem: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col space-y-4">
        {!preview && (
          <Button 
            variant="outline" 
            className="w-full relative overflow-hidden" 
            disabled={status.isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {status.isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {status.isUploading ? 'Enviando...' : buttonText}
            <input 
              type="file" 
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={allowedTypes.join(',')}
              disabled={status.isUploading}
            />
          </Button>
        )}
        
        {error && !status.isUploading && <UploadError error={error} />}
        
        {showPreview && preview && (
          <ImagePreview 
            previewUrl={preview} 
            onClear={clearPreview}
          />
        )}
        
        {status.isUploading && status.progress && <UploadProgress progress={status.progress.percentage} />}
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tamanho máximo: {maxSize}MB. Formatos permitidos: {allowedTypes.map(t => t.replace('image/', '.')).join(', ')}
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
