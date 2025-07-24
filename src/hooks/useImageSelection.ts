/**
 * Hook customizado para gerenciar seleção múltipla de imagens
 * FASE 1 - Core Functionality
 */

import { useState, useCallback, useMemo } from 'react';
import { SelectionState } from '@/types/download-multiple';

export interface UseImageSelectionProps {
  totalImages: number;
  imageIds: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const useImageSelection = ({ 
  totalImages, 
  imageIds, 
  onSelectionChange 
}: UseImageSelectionProps) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedImages: new Set<string>(),
    isSelectionMode: false,
    downloadProgress: new Map<string, number>(),
    downloadQueue: []
  });

  // Alternar modo de seleção
  const toggleSelectionMode = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      isSelectionMode: !prev.isSelectionMode,
      selectedImages: !prev.isSelectionMode ? new Set() : prev.selectedImages
    }));
  }, []);

  // Ativar modo de seleção
  const enableSelectionMode = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      isSelectionMode: true
    }));
  }, []);

  // Desativar modo de seleção
  const disableSelectionMode = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      isSelectionMode: false,
      selectedImages: new Set()
    }));
  }, []);

  // Selecionar/deselecionar uma imagem
  const toggleImageSelection = useCallback((imageId: string) => {
    setSelectionState(prev => {
      const newSelected = new Set(prev.selectedImages);
      
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }

      // Callback para notificar mudanças
      if (onSelectionChange) {
        onSelectionChange(Array.from(newSelected));
      }

      return {
        ...prev,
        selectedImages: newSelected,
        isSelectionMode: true // Ativa automaticamente o modo de seleção
      };
    });
  }, [onSelectionChange]);

  // Selecionar todas as imagens
  const selectAll = useCallback(() => {
    const allSelected = new Set(imageIds);
    
    setSelectionState(prev => ({
      ...prev,
      selectedImages: allSelected,
      isSelectionMode: true
    }));

    if (onSelectionChange) {
      onSelectionChange(imageIds);
    }
  }, [imageIds, onSelectionChange]);

  // Deselecionar todas as imagens
  const deselectAll = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      selectedImages: new Set()
    }));

    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  // Verificar se uma imagem está selecionada
  const isImageSelected = useCallback((imageId: string) => {
    return selectionState.selectedImages.has(imageId);
  }, [selectionState.selectedImages]);

  // Selecionar um range de imagens (Shift+Click)
  const selectRange = useCallback((startImageId: string, endImageId: string) => {
    const startIndex = imageIds.indexOf(startImageId);
    const endIndex = imageIds.indexOf(endImageId);
    
    if (startIndex === -1 || endIndex === -1) return;

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    const rangeIds = imageIds.slice(minIndex, maxIndex + 1);
    const newSelected = new Set([...selectionState.selectedImages, ...rangeIds]);

    setSelectionState(prev => ({
      ...prev,
      selectedImages: newSelected,
      isSelectionMode: true
    }));

    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  }, [imageIds, selectionState.selectedImages, onSelectionChange]);

  // Valores computados
  const selectedCount = useMemo(() => 
    selectionState.selectedImages.size, 
    [selectionState.selectedImages]
  );

  const selectedImageIds = useMemo(() => 
    Array.from(selectionState.selectedImages), 
    [selectionState.selectedImages]
  );

  const isAllSelected = useMemo(() => 
    selectedCount === totalImages && totalImages > 0, 
    [selectedCount, totalImages]
  );

  const hasSelection = useMemo(() => 
    selectedCount > 0, 
    [selectedCount]
  );

  const selectionPercentage = useMemo(() => 
    totalImages > 0 ? (selectedCount / totalImages) * 100 : 0, 
    [selectedCount, totalImages]
  );

  return {
    // Estado
    selectionState,
    isSelectionMode: selectionState.isSelectionMode,
    selectedImages: selectionState.selectedImages,
    selectedCount,
    selectedImageIds,
    
    // Estados computados
    isAllSelected,
    hasSelection,
    selectionPercentage,
    
    // Ações
    toggleSelectionMode,
    enableSelectionMode,
    disableSelectionMode,
    toggleImageSelection,
    selectAll,
    deselectAll,
    isImageSelected,
    selectRange,
    
    // Utilitários
    getSelectionSummary: () => ({
      total: totalImages,
      selected: selectedCount,
      percentage: selectionPercentage,
      isAllSelected,
      hasSelection
    })
  };
};