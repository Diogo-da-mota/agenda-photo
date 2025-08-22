import { useState, useEffect, useCallback, useRef } from 'react';
import { useBackgroundSync } from './useBackgroundSync';

interface AutoSaveOptions {
  delay?: number; // Delay em ms antes de salvar
  tableName: string;
  endpoint?: string;
  enabled?: boolean;
  onSave?: (data: any) => Promise<any>;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: Error | null;
}

/**
 * Hook para auto-save com Background Sync
 * Salva automaticamente dados após um período de inatividade
 * Funciona offline através do Background Sync
 */
export const useAutoSave = <T extends Record<string, any>>(
  initialData: T,
  options: AutoSaveOptions
) => {
  const {
    delay = 2000, // 2 segundos por padrão
    tableName,
    endpoint,
    enabled = true,
    onSave,
    onError,
    onSuccess
  } = options;

  const backgroundSync = useBackgroundSync({ enabled });
  
  const [data, setData] = useState<T>(initialData);
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T>(initialData);
  const hasChangesRef = useRef(false);

  // Atualizar referência dos dados
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Função de salvamento
  const performSave = useCallback(async (dataToSave: T): Promise<void> => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isSaving: true, saveError: null }));

    try {
      const savedData = await onSave!(dataToSave);
      if (import.meta.env.MODE === 'development') {
        console.log('[AutoSave] Dados salvos com sucesso:', tableName);
      }
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveError: null
      }));

      hasChangesRef.current = false;

      if (onSuccess) {
        onSuccess(savedData);
      }

    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Erro desconhecido no auto-save');
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError
      }));

      if (onError) {
        onError(saveError);
      }

      if (import.meta.env.MODE === 'development') {
        console.error('[AutoSave] Erro ao salvar dados:', error);
      }
    }
  }, [enabled, onSave, tableName, onSuccess, onError]);

  // Agendar salvamento automático
  const scheduleSave = useCallback(() => {
    if (!enabled || !hasChangesRef.current) return;

    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Agendar novo salvamento
    saveTimeoutRef.current = setTimeout(() => {
      performSave(dataRef.current);
    }, delay);
  }, [enabled, delay, performSave]);

  // Atualizar dados e agendar salvamento
  const updateData = useCallback((newData: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      const updatedData = typeof newData === 'function' ? newData(prev) : { ...prev, ...newData };
      
      // Verificar se houve mudanças reais
      const hasRealChanges = JSON.stringify(updatedData) !== JSON.stringify(prev);
      
      if (hasRealChanges) {
        hasChangesRef.current = true;
        setState(prevState => ({ ...prevState, hasUnsavedChanges: true }));
        
        // Agendar salvamento
        if (enabled) {
          setTimeout(scheduleSave, 0); // Executar no próximo tick
        }
      }
      
      return updatedData;
    });
  }, [enabled, scheduleSave]);

  // Salvar imediatamente
  const saveNow = useCallback(async (): Promise<void> => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    await performSave(dataRef.current);
  }, [performSave]);

  // Descartar mudanças não salvas
  const discardChanges = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    setData(initialData);
    setState(prev => ({
      ...prev,
      hasUnsavedChanges: false,
      saveError: null
    }));
    
    hasChangesRef.current = false;
  }, [initialData]);

  // Verificar se há mudanças pendentes
  const hasPendingChanges = useCallback((): boolean => {
    return hasChangesRef.current || state.hasUnsavedChanges;
  }, [state.hasUnsavedChanges]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Salvar antes de sair da página
  useEffect(() => {
    if (!enabled) return;

    // Usar pagehide em vez de beforeunload (mais moderno e confiável)
    const handlePageHide = (event: PageTransitionEvent) => {
      if (hasPendingChanges()) {
        // Tentar salvar rapidamente usando sendBeacon se disponível
        try {
          performSave(dataRef.current).catch(console.error);
        } catch (error) {
          console.error('[AutoSave] Erro ao salvar na saída da página:', error);
        }
      }
    };

    // Melhorar implementação do visibilitychange
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (hasPendingChanges()) {
          // Salvar quando a página ficar oculta
          performSave(dataRef.current).catch(console.error);
        }
      } else if (document.visibilityState === 'visible') {
        // Página voltou a ficar visível - pode verificar se há dados para sincronizar
        if (import.meta.env.MODE === 'development') {
          console.log('[AutoSave] Página voltou a ficar visível');
        }
      }
    };

    // Adicionar listener para quando a página perde o foco
    const handlePageFocus = () => {
      if (hasPendingChanges()) {
        // Salvar quando a página perde o foco
        performSave(dataRef.current).catch(console.error);
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handlePageFocus);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePageFocus);
    };
  }, [enabled, hasPendingChanges, performSave]);

  return {
    // Dados
    data,
    
    // Estado
    ...state,
    
    // Estado do Background Sync
    isOnline: backgroundSync.isOnline,
    pendingOperations: backgroundSync.pendingOperations,
    
    // Ações
    updateData,
    saveNow,
    discardChanges,
    hasPendingChanges,
    
    // Controle manual
    setData: updateData // Alias para updateData
  };
};
