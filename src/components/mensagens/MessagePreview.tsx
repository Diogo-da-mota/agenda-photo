import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { renderizarPreview } from '@/services/mensagemService';

type MessagePreviewProps = {
  template: string;
  className?: string;
};

export const MessagePreview = ({ template, className }: MessagePreviewProps) => {
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const carregarPreview = async () => {
      try {
        setLoading(true);
        const conteudoRenderizado = await renderizarPreview(template);
        setPreviewContent(conteudoRenderizado);
      } catch (error) {
        console.error('Erro ao renderizar preview:', error);
        setPreviewContent('Erro ao carregar preview');
      } finally {
        setLoading(false);
      }
    };
    
    carregarPreview();
  }, [template]);
  
  if (loading) {
    return (
      <div className={cn("whitespace-pre-wrap text-gray-500 text-sm sm:text-base p-3 sm:p-4", className)}>
        Carregando preview...
      </div>
    );
  }
  
  return (
    <div className={cn("whitespace-pre-wrap text-sm sm:text-base leading-relaxed p-3 sm:p-4 break-words", className)}>
      {previewContent}
    </div>
  );
};
