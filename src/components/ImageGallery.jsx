
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { getPortfolioImages, deletePortfolioImage } from '@/services/image/index';
import BlurImage from './BlurImage';

const ImageGallery = ({ className = '', refreshTrigger = 0, emptyMessage, maxItems }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load images on component mount and when refreshTrigger changes
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const portfolioImages = await getPortfolioImages();
        // If maxItems is provided, limit the number of images shown
        const limitedImages = maxItems ? portfolioImages.slice(0, maxItems) : portfolioImages;
        setImages(limitedImages);
      } catch (err) {
        console.error('Error loading portfolio images:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar imagens');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImages();
  }, [refreshTrigger, maxItems]);
  
  // Handle image deletion
  const handleDelete = async (imageUrl) => {
    if (!imageUrl || isDeleting) return;
    
    try {
      setIsDeleting(true);
      const success = await deletePortfolioImage(imageUrl);
      
      if (success) {
        setImages(prev => prev.filter(img => img.url !== imageUrl));
      } else {
        setError('Falha ao excluir imagem');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir imagem');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Open image in a new tab
  const handleView = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };
  
  // Show image details in a modal
  const handleSelect = (image) => {
    setSelectedImage(image);
  };
  
  // Render gallery
  return (
    <div>
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-gray-700"></Card>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-gray-600 rounded-lg">
          <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-gray-300">
            {emptyMessage || "Nenhuma imagem encontrada no portfólio"}
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
          {images.map((image, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden bg-gray-800 border-gray-700 hover:border-gray-500 transition-all"
            >
              <div className="aspect-square relative overflow-hidden">
                <BlurImage 
                  src={image.url} 
                  alt={`Portfolio image ${index + 1}`} 
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
                
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
                    onClick={() => handleDelete(image.url)}
                    disabled={isDeleting}
                    title="Excluir imagem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
