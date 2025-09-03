import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, ExternalLink, Grid, Search, Trash2, Edit, Upload, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import LazyTrabalhoModal from '@/components/lazy/LazyTrabalhoModal';
import PortfolioNavBar from '@/components/portfolio/PortfolioNavBar';
import { TrabalhoPortfolioResumo } from '@/services/portfolioService';
import { usePortfolioPaginado } from '@/hooks/portfolio/usePortfolioPaginado';
import { PortfolioSkeletonGrid } from '@/components/portfolio/PortfolioSkeletons';
import { useQueryClient } from '@tanstack/react-query';
import LazyImage from '@/components/LazyImage';
import { PortfolioItemCard } from '@/components/portfolio/PortfolioItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { usePrefetchProximosItens } from '@/hooks/portfolio/usePrefetchProximosItens';
import { usePortfolioDeletion } from '@/hooks/portfolio/usePortfolioDeletion';
import { ConfirmarDelecaoDialog } from '@/components/ui/ConfirmarDelecaoDialog';
import { StorageUsageBar } from '@/components/storage/StorageUsageBar';

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const location = useLocation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrabalho, setEditingTrabalho] = useState<TrabalhoPortfolioResumo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [cardToDelete, setCardToDelete] = useState<TrabalhoPortfolioResumo | null>(null);

  const {
    trabalhos,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    excluirTrabalho,
    criarTrabalho,
    isExcluindo,
    isCriando,
  } = usePortfolioPaginado(12, debouncedSearchTerm);

  const { deleteCard, isDeleting } = usePortfolioDeletion();

  // ✅ PREFETCH: Hook para pré-carregar próximos itens e detalhes
  const currentPage = useMemo(() => {
    return Math.ceil(trabalhos.length / 12);
  }, [trabalhos.length]);
  
  usePrefetchProximosItens(
    currentPage,
    12,
    debouncedSearchTerm,
    hasNextPage,
    total
  );

  // Listener para eventos de atualização do portfólio
  useEffect(() => {
    const handlePortfolioUpdate = (event: CustomEvent) => {
      // Invalidar cache do React Query para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['portfolio-trabalhos'] });
    };

    window.addEventListener('portfolioUpdated', handlePortfolioUpdate as EventListener);
    
    return () => {
      window.removeEventListener('portfolioUpdated', handlePortfolioUpdate as EventListener);
    };
  }, [queryClient]);

  // Scroll infinito conforme auditoria
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage > 0.8 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEdit = (trabalho: TrabalhoPortfolioResumo | null) => {
    setEditingTrabalho(trabalho);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTrabalho(null);
  };

  const handleSaveSuccess = () => {
    handleModalClose();
    // Invalida a query para forçar o recarregamento da lista de trabalhos
    queryClient.invalidateQueries({ queryKey: ['portfolio-trabalhos'] });
  };

  const handleExcluirTrabalho = useCallback(async (trabalhoId: string) => {
    if (confirm('Tem certeza que deseja excluir este trabalho? Esta ação não pode ser desfeita.')) {
      excluirTrabalho(trabalhoId);
    }
  }, [excluirTrabalho]);

  const handleCardClick = useCallback((trabalho: TrabalhoPortfolioResumo) => {
    if (!trabalho.id.startsWith('placeholder-')) {
      navigate(`/portfolio/${trabalho.titulo.replace(/\s+/g, '-')}`);
    }
  }, [navigate]);

  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/dashboard/portfolio/public')) return 'public';
    if (path.includes('/dashboard/portfolio/images')) return 'images';
    return 'portfolio';
  }, [location.pathname]);

  const showLoadingSkeleton = isLoading && trabalhos.length === 0;
  const showNoResultsFound = !isLoading && trabalhos.length === 0 && debouncedSearchTerm;
  const showEmptyPortfolio = !isLoading && trabalhos.length === 0 && !debouncedSearchTerm;

  const handleConfirmDelete = async () => {
    if (cardToDelete) {
      await deleteCard(cardToDelete.id);
      setCardToDelete(null); // Fecha o modal após a deleção
    }
  };

  return (
    <>
      <ResponsiveContainer>
        <div className="space-y-4 sm:space-y-6">
          {/* Header da página */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-center sm:text-left w-full sm:w-auto">Portfólio</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie os trabalhos do seu portfólio de fotografia
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:shrink-0 items-stretch sm:items-center gap-2">
              {/* Barra de busca - movida para a esquerda dos botões */}
              {trabalhos.length > 0 && (
                <div className="relative sm:w-[280px] sm:order-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar trabalhos..."
                    className="w-full rounded-lg bg-background pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              
              {/* Botões - agora à direita da barra de busca */}
              <div className="flex flex-row items-center gap-2 sm:order-2">
                <Button
                  onClick={() => handleEdit(null)}
                  className="shadow-sm flex-[3] sm:w-auto sm:flex-initial"
                  disabled={isCriando}
                >
                  {isCriando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Criando...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Adicionar trabalho</span>
                      <span className="sm:hidden">Adicionar</span>
                    </>
                  )}
                </Button>

                <Button asChild variant="outline" className="shadow-sm flex-1 sm:w-auto sm:flex-initial">
                  <Link
                    to="/portfolio/galeria"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir vitrine em nova aba"
                  >
                    <ExternalLink className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <PortfolioNavBar activeTab={activeTab} />
              {trabalhos.length > 0 && (
                <div className="flex flex-col gap-4 sm:w-[300px]">
                  <StorageUsageBar />
                </div>
              )}
            </div>
          </div>
        <div className="space-y-4 sm:space-y-6">
          {/* Lista de trabalhos ou loading */}
          {showLoadingSkeleton ? (
            <PortfolioSkeletonGrid count={6} />
          ) : showNoResultsFound ? (
            <EmptyState
              icon={Search}
              title="Nenhum trabalho encontrado"
              description={`Tente ajustar os termos de busca para "${debouncedSearchTerm}".`}
              className="md:col-span-2 lg:col-span-3"
            />
          ) : showEmptyPortfolio ? (
            <EmptyState
              icon={Grid}
              title="Nenhum trabalho no portfólio"
              description="Comece adicionando seu primeiro trabalho."
              className="md:col-span-2 lg:col-span-3"
              action={{
                label: "Adicionar primeiro trabalho",
                icon: Plus,
                onClick: () => handleEdit(null)
              }}
            />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Grid de trabalhos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 portfolio-grid">
                {trabalhos.map(trabalho => (
                  <PortfolioItemCard
                    key={trabalho.id}
                    trabalho={trabalho}
                    onEdit={() => handleEdit(trabalho)}
                    onDeleteRequest={() => setCardToDelete(trabalho)}
                    onCardClick={() => handleCardClick(trabalho)}
                    isDeleting={isDeleting && cardToDelete?.id === trabalho.id}
                  />
                ))}
              </div>

              {/* Indicador de carregamento de próxima página */}
              {isFetchingNextPage && (
                <div className="flex justify-center items-center py-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              )}

              {/* Botão carregar mais manual (fallback) */}
              {hasNextPage && !isFetchingNextPage && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => fetchNextPage()}
                    className="shadow-sm"
                  >
                    Carregar mais trabalhos
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </ResponsiveContainer>
      
      {/* Modal para Adicionar/Editar Trabalho */}
      <LazyTrabalhoModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveSuccess}
        trabalhoToEdit={editingTrabalho}
      />
      
      {/* Modal de confirmação de deleção */}
      <ConfirmarDelecaoDialog
        isOpen={!!cardToDelete}
        setIsOpen={(isOpen) => !isOpen && setCardToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Excluir "${cardToDelete?.titulo}"?`}
        description="Esta ação é permanente e removerá o card e todas as suas imagens do Supabase. Não pode ser desfeita."
        isConfirming={isDeleting}
      />
    </>
  );
};

export default Portfolio;
