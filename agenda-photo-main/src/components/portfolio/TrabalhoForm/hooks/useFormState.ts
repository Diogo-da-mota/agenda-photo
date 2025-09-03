import { useState, useEffect } from 'react';
import { CriarTrabalhoPortfolio } from '@/services/portfolioService';
import { deleteImage } from '@/services/supabase/uploadImage';

interface FormData {
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  tags: string[];
  imagens: string[];
  arquivos: File[];
  imagem_capa: string | null;
  imagensExistentes: string[];
}

interface UseFormStateProps {
  trabalhoInicial?: Partial<CriarTrabalhoPortfolio> | null;
}

export const useFormState = ({ trabalhoInicial }: UseFormStateProps) => {
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagensARemover, setImagensARemover] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    categoria: '',
    local: '',
    descricao: '',
    tags: [],
    imagens: [],
    arquivos: [],
    imagem_capa: null,
    imagensExistentes: [],
  });
  
  useEffect(() => {
    if (trabalhoInicial) {
      setFormData({
        titulo: trabalhoInicial.titulo || '',
        categoria: trabalhoInicial.categoria || '',
        local: trabalhoInicial.local || '',
        descricao: trabalhoInicial.descricao || '',
        tags: trabalhoInicial.tags || [],
        imagens: [], // Novas imagens sempre começam vazias
        arquivos: [], // Novos arquivos sempre começam vazios
        imagem_capa: trabalhoInicial.imagem_capa || null,
        imagensExistentes: trabalhoInicial.imagens || [],
      });
    } else {
      resetForm();
    }
  }, [trabalhoInicial]);


  const handleInputChange = (field: keyof Omit<FormData, 'tags' | 'imagens' | 'arquivos' | 'imagensExistentes'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleRemoverImagemExistente = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imagensExistentes: prev.imagensExistentes.filter(imgUrl => imgUrl !== url),
      // Se a imagem removida era a capa, define a capa como nula.
      imagem_capa: prev.imagem_capa === url ? null : prev.imagem_capa
    }));
    setImagensARemover(prev => [...prev, url]);
  };

  const handleSetCapa = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imagem_capa: url
    }));
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      categoria: '',
      local: '',
      descricao: '',
      tags: [],
      imagens: [],
      arquivos: [],
      imagem_capa: null,
      imagensExistentes: [],
    });
    setImagensARemover([]);
  };

  return {
    formData,
    setFormData,
    tagInput,
    setTagInput,
    isLoading,
    setIsLoading,
    imagensARemover,
    handleInputChange,
    handleAddTag,
    handleRemoveTag,
    handleRemoverImagemExistente,
    handleSetCapa,
    resetForm
  };
};
