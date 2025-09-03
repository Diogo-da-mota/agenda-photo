import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { TrabalhoPortfolioResumo } from '@/services/portfolioService';
import { usePrefetchTrabalho } from '@/hooks/portfolio/usePrefetchTrabalho';

interface PortfolioItemCardProps {
  trabalho: TrabalhoPortfolioResumo;
  onEdit: () => void;
  onDeleteRequest: (trabalho: TrabalhoPortfolioResumo) => void;
  onCardClick: () => void;
  isDeleting: boolean;
}

const PortfolioItemCardComponent: React.FC<PortfolioItemCardProps> = ({
  trabalho,
  onEdit,
  onDeleteRequest,
  onCardClick,
  isDeleting,
}) => {
  const { prefetchTrabalho } = usePrefetchTrabalho();

  const handleEditHover = () => {
    if (!trabalho.id.startsWith('placeholder-')) {
      prefetchTrabalho(trabalho.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRequest(trabalho);
  };

  return (
    <Card 
      key={trabalho.id} 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${trabalho.id.startsWith('placeholder-') ? 'border-dashed opacity-75' : ''}`}
    >
      {!trabalho.id.startsWith('placeholder-') && (
        <div className="absolute inset-0 z-10 flex flex-col sm:flex-row items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            onMouseEnter={handleEditHover}
            title="Editar trabalho"
            className="w-full sm:w-auto portfolio-action-btn"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Deletar trabalho"
            className="w-full sm:w-auto portfolio-action-btn"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </Button>
        </div>
      )}

      <CardHeader className="p-0">
        <div className="relative">
          <LazyImage
            src={trabalho.imagem_principal}
            alt={trabalho.titulo}
            className={`w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 ${!trabalho.id.startsWith('placeholder-') ? 'cursor-pointer' : ''}`}
            width={400}
            height={192}
            priority={trabalho.id.startsWith('placeholder-') ? 'low' : 'high'}
          />
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 card-content">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg line-clamp-1">{trabalho.titulo}</CardTitle>
            <CardDescription className="text-sm">{trabalho.categoria}</CardDescription>
          </div>
        </div>
        
        {trabalho.local && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            📍 {trabalho.local}
          </p>
        )}
        
        {trabalho.tags_preview.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 portfolio-tags">
            {trabalho.tags_preview.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs flex-shrink-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const PortfolioItemCard = React.memo(PortfolioItemCardComponent); 