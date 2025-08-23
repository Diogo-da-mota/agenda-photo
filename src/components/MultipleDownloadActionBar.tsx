/**
 * Barra de ação para downloads múltiplos
 * FASE 1 - Core Functionality
 */

import React from 'react';
import { Download, X, CheckSquare, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ActionBarConfig } from '@/types/download-multiple';

interface MultipleDownloadActionBarProps {
  selectedCount: number;
  totalImages: number;
  isDownloading: boolean;
  overallProgress: number;
  completedImages: number;
  failedImages: number;
  onDownloadSelected: () => void;
  onDownloadAll: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCancel: () => void;
  onClose: () => void;
  config?: ActionBarConfig;
  className?: string;
}

export const MultipleDownloadActionBar: React.FC<MultipleDownloadActionBarProps> = ({
  selectedCount,
  totalImages,
  isDownloading,
  overallProgress,
  completedImages,
  failedImages,
  onDownloadSelected,
  onDownloadAll,
  onSelectAll,
  onDeselectAll,
  onCancel,
  onClose,
  config = {},
  className
}) => {
  const {
    showSelectAll = true,
    showDownloadAll = true,
    showProgress = true,
    showStats = true,
    position = 'bottom'
  } = config;

  const isAllSelected = selectedCount === totalImages;
  const hasSelection = selectedCount > 0;

  // Renderizar progresso do download
  const renderDownloadProgress = () => {
    if (!isDownloading || !showProgress) return null;

    return (
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
              <span className="text-gray-700 font-medium truncate">
                Baixando fotos...
              </span>
              <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress 
              value={overallProgress} 
              className="h-1.5 sm:h-2"
            />
            {showStats && (
              <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-1">
                <span className="hidden sm:inline">Concluídas: {completedImages}</span>
                <span className="sm:hidden">{completedImages}/{totalImages}</span>
                {failedImages > 0 && (
                  <span className="text-red-500">Falharam: {failedImages}</span>
                )}
                <span className="hidden sm:inline">Total: {totalImages}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Cancelar</span>
          <X className="h-4 w-4 sm:hidden" />
        </Button>
      </div>
    );
  };

  // Renderizar controles de seleção
  const renderSelectionControls = () => {
    if (isDownloading) return null;

    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Contador de seleção */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
          <span className="font-medium">
            <span className="sm:hidden">{selectedCount}/{totalImages}</span>
            <span className="hidden sm:inline">{selectedCount} de {totalImages} selecionadas</span>
          </span>
        </div>

        {/* Botões de seleção */}
        {showSelectAll && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="text-gray-600 hover:text-gray-800 px-2 sm:px-3"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Desmarcar todas</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Selecionar todas</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Renderizar botões de download
  const renderDownloadButtons = () => {
    if (isDownloading) return null;

    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Download selecionadas */}
        <Button
          onClick={onDownloadSelected}
          disabled={!hasSelection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3"
          size="sm"
        >
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Baixar selecionadas ({selectedCount})</span>
          <span className="sm:hidden">({selectedCount})</span>
        </Button>

        {/* Download todas */}
        {showDownloadAll && (
          <Button
            onClick={onDownloadAll}
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-2 sm:px-3"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Baixar todas ({totalImages})</span>
            <span className="sm:hidden">Todas</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 bg-white border-t shadow-lg",
        "transition-all duration-300 ease-in-out",
        position === 'top' ? 'top-0 border-b border-t-0' : 'bottom-0',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Lado esquerdo - Progresso ou Controles */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {isDownloading ? renderDownloadProgress() : renderSelectionControls()}
          </div>

          {/* Lado direito - Botões de ação */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {renderDownloadButtons()}
            
            {/* Botão fechar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 sm:p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente wrapper para facilitar o uso
interface MultipleDownloadActionBarWrapperProps {
  isVisible: boolean;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const MultipleDownloadActionBarWrapper: React.FC<MultipleDownloadActionBarWrapperProps> = ({
  isVisible,
  children,
  position = 'bottom'
}) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      {/* Espaçamento para a barra de ação */}
      <div 
        className={cn(
          "h-16", // Altura da barra de ação + padding
          position === 'top' ? 'order-first' : 'order-last'
        )} 
      />
    </div>
  );
};