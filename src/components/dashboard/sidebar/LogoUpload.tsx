
import React, { useState } from 'react';
import { Upload, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  companyLogo: string | null;
  onLogoUpload: (file: File) => Promise<void>;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ 
  companyLogo, 
  onLogoUpload 
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setIsSaving(true);
    
    try {
      // Simple file type validation
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo selecionado não é uma imagem válida.');
      }
      
      // Call the upload handler passed from parent
      await onLogoUpload(file);
    } catch (error) {
      console.error("Logo upload error:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="h-24 w-24 rounded-md overflow-hidden border flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-800">
        {companyLogo ? (
          <img 
            src={companyLogo} 
            alt="Logo da empresa" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center justify-center">
            <span className="text-xs text-center">Logo</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-3 text-xs text-red-500 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="relative">
        <input
          type="file"
          id="logo-upload"
          accept="image/*"
          onChange={handleLogoUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isSaving}
        />
        <Button 
          variant="outline"
          className="w-full text-xs h-8"
          disabled={isSaving}
          type="button"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Salvando logo...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 mr-1" />
              {companyLogo ? 'Alterar logo' : 'Upload de logo'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default LogoUpload;
