
import React, { useEffect, useState } from 'react';
import BlurImage from './BlurImage';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';
import { Trash2, Eye, X } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

// Interface para os itens de imagem usando dados simulados
interface ImageItem {
  id: string;
  url: string;
  nome?: string;
  criado_em?: string;
  atualizado_em?: string;
  user_id?: string;
}

export interface ImageGalleryProps {
  images?: ImageItem[];
  onDelete?: (id: string) => void;
  refreshTrigger?: number;
  emptyMessage?: string;
  editable?: boolean;
  className?: string;
  searchTerm?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images: externalImages,
  onDelete,
  refreshTrigger,
  emptyMessage = "Nenhuma imagem encontrada",
  editable = true,
  className = "",
  searchTerm = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Se imagens externas foram fornecidas, use-as
        if (externalImages) {
          setGalleryImages(externalImages);
        } else {
          // Usando dados simulados já que a tabela portfolio_imagens não existe
          const mockImages: ImageItem[] = [
            {
              id: '1',
              url: '/placeholder.svg',
              nome: 'Imagem de exemplo 1',
              criado_em: new Date().toISOString(),
              atualizado_em: new Date().toISOString(),
              user_id: 'mock-user'
            },
            {
              id: '2',
              url: '/placeholder.svg',
              nome: 'Imagem de exemplo 2',
              criado_em: new Date().toISOString(),
              atualizado_em: new Date().toISOString(),
              user_id: 'mock-user'
            }
          ];

          setGalleryImages(mockImages);
        }
      } catch (err) {
        console.error('Erro ao carregar imagens:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar imagens');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImages();
  }, [refreshTrigger, externalImages]);
  
  // Função para lidar com a exclusão de imagens
  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      // Se um manipulador de exclusão personalizado foi fornecido, use-o
      if (onDelete) {
        onDelete(imageId);
      } else {
        // Para dados simulados, apenas remove da lista local
        setGalleryImages(prev => prev.filter(img => img.id !== imageId));

      }
    } catch (err) {
      console.error('Erro ao excluir imagem:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir imagem');
      
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a imagem.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Função para visualizar a imagem em uma nova aba
  const handleView = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };
  
  // Filtrar imagens se um termo de pesquisa for fornecido
  const filteredImages = searchTerm 
    ? galleryImages.filter(img => 
        img.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.nome && img.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : galleryImages;
  
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">
        {error}
      </div>
    );
  }
  
  if (!filteredImages || filteredImages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 border border-dashed rounded-lg ${className}`}>
        <p className="text-muted-foreground text-center">
          {emptyMessage}
        </p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {filteredImages.map((image) => (
        <Card key={image.id} className="overflow-hidden group relative">
          <CardContent className="p-0">
            <div className="aspect-square relative overflow-hidden">
              <BlurImage 
                src={image.url} 
                alt={image.nome || "Imagem da galeria"} 
                className="object-cover h-48 w-full"
                width={300}
                height={200}
              />
              {editable && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={() => handleView(image.url)}
                    title="Visualizar imagem"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => handleDelete(image.id, image.url)}
                    disabled={isDeleting}
                    title="Excluir imagem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ImageGallery;
