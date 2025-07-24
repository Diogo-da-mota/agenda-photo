import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarTrabalhoPublicoPorTitulo } from '@/services/portfolio/queries/publicQueries';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Eye, X, ArrowRight, ArrowDown } from 'lucide-react';
import { LazyImage } from '@/components/portfolio/unified/LazyImage';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PortfolioFooter } from '@/components/portfolio/public/PortfolioFooter';
import './PortfolioGaleriaTrabalho.css';

interface TrabalhoCompleto {
  id: string;
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  tags: string[];
  imagens: string[];
  criado_em: string;
  imagem_principal?: string;
}

interface ImageWithDimensions {
  id: string;
  url: string;
  width: number;
  height: number;
}

// Componente memoizado para item de imagem da galeria
const GaleriaImageItem = React.memo<{
  imagem: ImageWithDimensions;
  trabalhoTitulo: string;
  onImageClick: (index: number) => void;
  imageIndex: number;
}>(({ imagem, trabalhoTitulo, onImageClick, imageIndex }) => (
  <div 
    className="portfolio-image-container relative overflow-hidden rounded-lg bg-gray-800 cursor-pointer"
    onClick={() => onImageClick(imageIndex)}
  >
    <LazyImage 
      src={imagem.url} 
      alt={`${trabalhoTitulo} - Imagem ${parseInt(imagem.id) + 1}`}
      className="w-full h-auto object-cover"
    />
  </div>
));

// Componente memoizado para miniatura do lightbox
const LightboxThumbnail = React.memo<{
  img: ImageWithDimensions;
  idx: number;
  isActive: boolean;
  onClick: (idx: number) => void;
}>(({ img, idx, isActive, onClick }) => (
  <div 
    className={`
      w-16 h-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer image-thumbnail
      ${isActive ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'}
    `}
    onClick={() => onClick(idx)}
  >
    <img
      src={img.url}
      alt={`Miniatura ${idx + 1}`}
      className="w-full h-full object-cover"
    />
  </div>
));

export default function PortfolioGaleriaTrabalho() {
  const { id: titulo } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trabalho, setTrabalho] = useState<TrabalhoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagens, setImagens] = useState<ImageWithDimensions[]>([]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Função otimizada para carregar dimensões de imagem
  const carregarDimensaoImagem = useCallback((url: string, index: number): Promise<ImageWithDimensions> => {
    return new Promise((resolve) => {
                  const img = new Image();
                  img.onload = () => {
                    resolve({
                      id: `${index}`,
                      url: url,
                      width: img.naturalWidth,
                      height: img.naturalHeight
                    });
                  };
                  img.onerror = () => {
                    resolve({
                      id: `${index}`,
                      url: url,
                      width: 400,
                      height: 300
                    });
                  };
                  img.src = url;
                });
  }, []);

  const carregarTrabalho = useCallback(async () => {
    if (!titulo) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Converter hífens de volta para espaços para buscar no banco
      const tituloParaBusca = titulo.replace(/-/g, ' ');
      const trabalhoData = await buscarTrabalhoPublicoPorTitulo(tituloParaBusca);
      if (trabalhoData) {
        setTrabalho(trabalhoData);
        
        // Carregar dimensões das imagens de forma otimizada
        if (trabalhoData.imagens.length > 0) {
          const imagensComDimensoes = await Promise.all(
            trabalhoData.imagens.map((url, index) => carregarDimensaoImagem(url, index))
            );
            setImagens(imagensComDimensoes);
          }
        } else {
          setError('Trabalho não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao carregar trabalho:', error);
        setError('Erro ao carregar trabalho. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
  }, [titulo, carregarDimensaoImagem]);

  useEffect(() => {
    carregarTrabalho();
  }, [carregarTrabalho]);

  // Função otimizada para distribuir imagens em colunas respeitando proporções
  const getColumnImages = useMemo(() => {
    const screenWidth = window.innerWidth;
    let numColumns = 2; // Padrão para mobile
    
    if (screenWidth >= 1024) numColumns = 4; // lg
    else if (screenWidth >= 768) numColumns = 3; // md
    else if (screenWidth >= 640) numColumns = 2; // sm
    
    const columns: ImageWithDimensions[][] = Array.from({ length: numColumns }, () => []);
    const columnHeights = new Array(numColumns).fill(0);
    
    imagens.forEach((imagem) => {
      // Encontrar a coluna com menor altura
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Adicionar imagem à coluna mais baixa
      columns[shortestColumnIndex].push(imagem);
      
      // Atualizar altura da coluna (usando aspect ratio)
      const aspectRatio = imagem.width / imagem.height;
      const imageHeight = 300 / aspectRatio; // Largura base de 300px
      columnHeights[shortestColumnIndex] += imageHeight + 8; // +8 para gap
    });
    
    return columns;
  }, [imagens]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const nextImage = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < imagens.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, imagens.length]);

  const prevImage = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  // Otimização de navegação por teclado
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
      }
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  useEffect(() => {
    if (lightboxIndex !== null) {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [lightboxIndex, handleKeyPress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando trabalho...</p>
        </div>
      </div>
    );
  }

  if (error || !trabalho) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-white mb-4">{error || 'Trabalho não encontrado'}</p>
          <Button 
            onClick={() => navigate('/portfolio/galeria')} 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Galeria
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header Banner */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Botão voltar */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/portfolio/galeria')}
            className="mb-6 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Galeria
          </Button>

          {/* Título e informações do trabalho */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {trabalho.titulo.toUpperCase()}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {trabalho.local}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(trabalho.criado_em).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                {imagens.length} fotos
              </div>
            </div>

            {trabalho.descricao && (
              <p className="text-white/70 max-w-2xl mx-auto">
                {trabalho.descricao}
              </p>
            )}

            {trabalho.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {trabalho.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/10 text-white border-white/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Galeria de Imagens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="masonry-grid">
          {getColumnImages.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-4">
              {column.map((imagem, imgIndex) => (
                <GaleriaImageItem
                  key={imagem.id}
                  imagem={imagem}
                  trabalhoTitulo={trabalho.titulo}
                  onImageClick={openLightbox}
                  imageIndex={imagens.findIndex(img => img.id === imagem.id)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer com contatos */}
      <PortfolioFooter />

      {/* Lightbox para visualização em tela cheia */}
      {lightboxIndex !== null && (
        <div className="fullscreen-overlay">
          {/* Barra superior com controles */}
          <div className="p-4 flex justify-between items-center control-bar">
            <div className="flex items-center text-white space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={closeLightbox}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
              <span className="text-sm">{lightboxIndex + 1} / {imagens.length}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                disabled={lightboxIndex === 0}
                className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                disabled={lightboxIndex === imagens.length - 1}
                className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Área principal da imagem */}
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={imagens[lightboxIndex]?.url || ''}
                alt={`${trabalho.titulo} - Imagem ${lightboxIndex + 1}`}
                className="fullscreen-image"
              />
            </div>
          </div>
          
          {/* Barra inferior com informações e miniaturas */}
          <div className="p-4 control-bar">
            <div className="flex justify-between items-center text-white">
              <div className="truncate max-w-[50%]">
                <h3 className="font-bold truncate">{trabalho.titulo}</h3>
                <p className="text-sm text-white/70 truncate">{trabalho.local} • {new Date(trabalho.criado_em).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="flex space-x-2">
                {/* Botões adicionais podem ser adicionados aqui */}
              </div>
            </div>
            
            {/* Miniaturas para navegação rápida */}
            <div className="mt-4 overflow-x-auto pb-2 thumbnails-container">
              <div className="flex space-x-2">
                {imagens.map((img, idx) => (
                  <LightboxThumbnail
                    key={img.id}
                    img={img}
                    idx={idx}
                    isActive={idx === lightboxIndex}
                    onClick={setLightboxIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 