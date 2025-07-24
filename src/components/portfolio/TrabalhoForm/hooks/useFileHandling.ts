
import { useRef } from 'react';

interface FormData {
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  tags: string[];
  imagens: string[];
  arquivos: File[];
}

interface UseFileHandlingProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const useFileHandling = ({ formData, setFormData }: UseFileHandlingProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    setFormData(prev => ({
      ...prev,
      arquivos: [...prev.arquivos, ...newFiles]
    }));

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({
            ...prev,
            imagens: [...prev.imagens, e.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
      arquivos: prev.arquivos.filter((_, i) => i !== index)
    }));
  };

  return {
    fileInputRef,
    handleFileUpload,
    handleRemoveImage
  };
};
