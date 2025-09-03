import React from 'react';
import { CriarTrabalhoPortfolio, CriarTrabalhoComImagens } from '@/services/portfolioService';
import { useTrabalhoForm } from './useTrabalhoForm';
import { validateTrabalhoForm } from './formValidation';
import FormBasicFields from './FormBasicFields';
import TagsSection from './TagsSection';
import ImageUploadSection from './ImageUploadSection';
import ActionButtons from './ActionButtons';
import ProgressSection from './ProgressSection';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface TrabalhoFormProps {
  onSave?: (trabalho: CriarTrabalhoPortfolio) => void;
  onSaveWithImages?: (trabalho: CriarTrabalhoComImagens) => void;
  onCancel?: () => void;
  trabalhoInicial?: Partial<CriarTrabalhoPortfolio> | null;
}

const TrabalhoForm: React.FC<TrabalhoFormProps> = ({ 
  onSave, 
  onSaveWithImages,
  onCancel, 
  trabalhoInicial
}) => {
  const {
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
  } = useTrabalhoForm({ trabalhoInicial, onSaveWithImages, onCancel });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        input.files = files;
        handleFileUpload({ target: input } as any);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTrabalhoForm(formData, toast)) return;
    
    setIsLoading(true);
    setUploadProgress(null);

    try {
      if (!onSaveWithImages) {
        toast({
          title: "❌ Erro",
          description: "Função de salvamento não está disponível",
          variant: "destructive",
        });
        return;
      }

      const trabalhoData: CriarTrabalhoPortfolio = {
        titulo: formData.titulo.trim(),
        categoria: formData.categoria,
        local: formData.local.trim(),
        descricao: formData.descricao.trim(),
        tags: formData.tags,
        imagens: formData.imagensExistentes,
        imagem_capa: formData.imagem_capa || (formData.imagensExistentes.length > 0 ? formData.imagensExistentes[0] : null)
      };

      const trabalhoComImagens: CriarTrabalhoComImagens = {
        trabalho: trabalhoData,
        arquivos: formData.arquivos,
        imagensARemover: imagensARemover
      };

      await onSaveWithImages(trabalhoComImagens);

      // 

      resetForm();

    } catch (error) {
      console.error('[TrabalhoForm] Erro ao salvar:', error);
      toast({
        title: "❌ Erro ao publicar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <FormBasicFields
        titulo={formData.titulo}
        categoria={formData.categoria}
        local={formData.local}
        descricao={formData.descricao}
        onInputChange={handleInputChange}
      />

      <TagsSection
        tags={formData.tags}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
        onCancel={onCancel}
      />

      {/* Seção de Upload de Imagens */}
      <div className="p-4 border border-dashed rounded-md">
         <ImageUploadSection
            imagensExistentes={formData.imagensExistentes}
            onRemoveExistente={handleRemoverImagemExistente}
            imagens={formData.imagens}
            onRemoveImage={handleRemoveImage}
            imagemCapa={formData.imagem_capa}
            onSetCapa={handleSetCapa}
          />

        <div className="mt-4 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
          />
          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
            Selecionar Imagens
          </Button>
          <p className="mt-2 text-sm text-gray-500">ou arraste e solte os arquivos aqui</p>
        </div>
      </div>
     
      <ProgressSection uploadProgress={uploadProgress} />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {trabalhoInicial && 'id' in trabalhoInicial ? 'Salvar Alterações' : 'Publicar Trabalho'}
        </Button>
      </div>
    </form>
  );
};

export default TrabalhoForm;
