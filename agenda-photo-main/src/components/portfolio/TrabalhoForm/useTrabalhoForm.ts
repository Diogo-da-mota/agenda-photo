import { useToast } from '@/hooks/use-toast';
import { CriarTrabalhoPortfolio, CriarTrabalhoComImagens } from '@/services/portfolioService';
import { useFormState } from './hooks/useFormState';
import { useFileHandling } from './hooks/useFileHandling';
import { useUploadProgress } from './hooks/useUploadProgress';

interface UseTrabalhoFormProps {
  trabalhoInicial?: Partial<CriarTrabalhoPortfolio> | null;
  onSaveWithImages?: (trabalho: CriarTrabalhoComImagens) => void;
  onCancel?: () => void;
}

export const useTrabalhoForm = ({ trabalhoInicial, onSaveWithImages, onCancel }: UseTrabalhoFormProps) => {
  const { toast } = useToast();
  
  const {
    formData,
    setFormData,
    tagInput,
    setTagInput,
    isLoading,
    setIsLoading,
    handleInputChange,
    handleAddTag,
    handleRemoveTag,
    resetForm,
    imagensARemover,
    handleRemoverImagemExistente,
    handleSetCapa
  } = useFormState({ trabalhoInicial });

  const {
    fileInputRef,
    handleFileUpload,
    handleRemoveImage
  } = useFileHandling({ formData, setFormData });

  const {
    uploadProgress,
    setUploadProgress
  } = useUploadProgress();

  return {
    formData,
    tagInput,
    setTagInput,
    isLoading,
    setIsLoading,
    uploadProgress,
    setUploadProgress,
    fileInputRef,
    toast,
    handleInputChange,
    handleAddTag,
    handleRemoveTag,
    handleFileUpload,
    handleRemoveImage,
    resetForm,
    imagensARemover,
    handleRemoverImagemExistente,
    handleSetCapa
  };
};
