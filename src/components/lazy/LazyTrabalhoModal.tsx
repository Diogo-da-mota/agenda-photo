import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { TrabalhoPortfolioResumo } from '@/services/portfolioService';

// Lazy load do TrabalhoModal
const TrabalhoModal = lazy(() => import('@/components/portfolio/TrabalhoModal'));

interface LazyTrabalhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  trabalhoToEdit?: TrabalhoPortfolioResumo | null;
}

/**
 * Versão lazy do TrabalhoModal que só carrega quando necessário
 * Melhora o bundle inicial da aplicação
 */
const LazyTrabalhoModal: React.FC<LazyTrabalhoModalProps> = (props) => {
  // Só renderizar quando o modal estiver aberto
  if (!props.isOpen) {
    return null;
  }

  const fallback = (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando modal...</span>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <TrabalhoModal {...props} />
    </Suspense>
  );
};

export default LazyTrabalhoModal;
