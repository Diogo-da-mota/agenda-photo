import React from 'react';
import { Trash2, Star } from 'lucide-react';

interface ImageUploadSectionProps {
  imagens: string[];
  imagensExistentes: string[];
  onRemoveImage: (index: number) => void;
  onRemoveExistente: (url: string) => void;
  imagemCapa: string | null;
  onSetCapa: (url: string) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imagens,
  imagensExistentes,
  onRemoveImage,
  onRemoveExistente,
  imagemCapa,
  onSetCapa,
}) => {
  const renderImagem = (url: string, index: number, isNova: boolean) => {
    const isCapa = imagemCapa === url;

    return (
      <div key={`${isNova ? 'nova' : 'existente'}-${index}`} className="relative group aspect-square">
        <img
          src={url}
          alt={`Imagem ${index + 1}`}
          className="w-full h-full object-cover rounded-md"
        />
        <button
          type="button"
          onClick={() => isNova ? onRemoveImage(index) : onRemoveExistente(url)}
          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
          aria-label="Remover imagem"
        >
          <Trash2 className="h-3 w-3" />
        </button>

        {!isNova && (
          <button
            type="button"
            onClick={() => onSetCapa(url)}
            className={`absolute top-1 left-1 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
              isCapa ? 'bg-yellow-400 text-white' : 'bg-gray-800 bg-opacity-50 text-white hover:bg-yellow-500'
            }`}
            aria-label="Definir como capa"
          >
            <Star className={`h-3 w-3 ${isCapa ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  if (imagens.length === 0 && imagensExistentes.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-2">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Imagens do Projeto</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {imagensExistentes.map((url, index) => renderImagem(url, index, false))}
        {imagens.map((url, index) => renderImagem(url, index, true))}
      </div>
    </div>
  );
};

export default ImageUploadSection;
