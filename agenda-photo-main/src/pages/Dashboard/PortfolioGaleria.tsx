import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { buscarTrabalhosPortfolioPublicos, TrabalhoPortfolioResumo, CATEGORIAS_PORTFOLIO } from '@/services/portfolioService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ArrowRight, MapPin, Calendar, Tag, Eye, Search } from 'lucide-react';
import { LazyImage } from '@/components/portfolio/unified/LazyImage';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useNavigate } from 'react-router-dom';
import { PortfolioHeader } from '@/components/portfolio/public/PortfolioHeader';
import { PortfolioFooter } from '@/components/portfolio/public/PortfolioFooter';
import { useEmpresa } from '@/hooks/useEmpresa';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ITEMS_PER_PAGE = 12;

// Componente memoizado para o card do trabalho
const TrabalhoCard = React.memo<{ trabalho: TrabalhoPortfolioResumo; onClick: () => void }>(({ trabalho, onClick }) => (
  <Card 
    className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02]"
    onClick={onClick}
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      <LazyImage
        src={trabalho.imagem_principal || "https://utfs.io/f/4c2815c6-3a51-4f9d-b961-599595ac919b-1j9ayv.png"}
        alt={trabalho.titulo}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs px-2 py-1 rounded-md">
        {trabalho.categoria}
      </div>
    </div>
    
    <CardHeader className="pb-2">
      <CardTitle className="text-xl">
        {trabalho.titulo}
      </CardTitle>
    </CardHeader>
    
    <CardContent className="pt-0">
      {trabalho.local && (
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
          {trabalho.local}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-primary hover:underline">
          Clique para ver galeria
        </span>
        <span className="text-sm text-muted-foreground">
          {new Date(trabalho.criado_em).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </CardContent>
  </Card>
));

export default function PortfolioGaleria() {
  const [trabalhos, setTrabalhos] = useState<TrabalhoPortfolioResumo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const { configuracoes } = useEmpresa();
  
  const navigate = useNavigate();

  useEffect(() => {
    const carregarTrabalhos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const trabalhosData = await buscarTrabalhosPortfolioPublicos(page, ITEMS_PER_PAGE);
        
        if (page === 1) {
          setTrabalhos(trabalhosData.trabalhos);
        } else {
          setTrabalhos(prev => [...prev, ...trabalhosData.trabalhos]);
        }
        
        setTotal(trabalhosData.total);
        setHasMore(trabalhosData.trabalhos.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Erro ao carregar trabalhos:', error);
        setError('Erro ao carregar portfólio. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    carregarTrabalhos();
  }, [page]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  // Filtragem otimizada dos trabalhos com base na pesquisa e categoria
  const trabalhosFiltrados = useMemo(() => {
    return trabalhos.filter(trabalho => {
    const matchesSearch = searchTerm === '' || 
      trabalho.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabalho.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabalho.local.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = categoriaFiltro === 'todas' || trabalho.categoria === categoriaFiltro;
    
    return matchesSearch && matchesCategoria;
  });
  }, [trabalhos, searchTerm, categoriaFiltro]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header com dados do fotógrafo */}
      <PortfolioHeader 
        trabalhosRealizados={trabalhos.length > 0 ? trabalhos.length : 3}
        especialidades={3}
        anosExperiencia={5}
      />
      
      <main className="flex-grow">
        <div className="container mx-auto py-8">
          {/* Barra de pesquisa e filtros */}
          <div className="mx-auto max-w-6xl mb-8 p-4 bg-card/50 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1 flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar trabalhos..."
                    className="w-full pl-10 bg-background border-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-[250px]">
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="w-full bg-background border-input">
                    <SelectValue placeholder="Todas as especialidades" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="todas">Todas as especialidades</SelectItem>
                    {CATEGORIAS_PORTFOLIO.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-destructive mb-4 p-4 bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {trabalhosFiltrados.map(trabalho => (
              <TrabalhoCard 
                key={trabalho.id} 
                trabalho={trabalho}
                onClick={() => navigate(`/portfolio/galeria/${trabalho.titulo.replace(/\s+/g, '-')}`)}
              />
            ))}
            
            {/* Skeleton loading */}
            {isLoading && Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden">
                <div className="aspect-[4/3]">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-8 py-2"
              >
                {isLoading ? "Carregando..." : "Carregar Mais"}
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer com contatos */}
      <PortfolioFooter />
    </div>
  );
}
