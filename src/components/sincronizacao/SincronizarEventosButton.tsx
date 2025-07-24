import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { sincronizarTodosEventosFinanceiro } from '@/services/agendaService';
import { logger } from '@/utils/logger';

interface SincronizarEventosButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const SincronizarEventosButton: React.FC<SincronizarEventosButtonProps> = ({ 
  variant = 'outline',
  size = 'sm'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [resultados, setResultados] = useState<{
    total: number;
    sucessos: number;
    falhas: number;
    detalhes: Array<{eventoId: string; sucesso: boolean; erro?: string}>;
  } | null>(null);
  const { user } = useAuth();

  const handleSincronizar = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para sincronizar eventos');
      return;
    }

    setIsLoading(true);
    setResultados(null);
    
    try {
      logger.info('[SincronizarEventosButton] Iniciando sincronização manual de eventos');
      const resultado = await sincronizarTodosEventosFinanceiro(user.id);
      setResultados(resultado);
      
      if (resultado.falhas === 0) {
        toast.success(`${resultado.total} evento(s) sincronizado(s) com sucesso!`);
      } else {
        toast.warning(`Sincronização concluída com avisos: ${resultado.sucessos} sucesso(s) e ${resultado.falhas} falha(s)`);
      }
      
      logger.info('[SincronizarEventosButton] Sincronização manual concluída:', resultado);
    } catch (error) {
      logger.error('[SincronizarEventosButton] Erro na sincronização manual:', error);
      toast.error('Erro ao sincronizar eventos com o financeiro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Sincronizar Eventos e Financeiro
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sincronizar Eventos com Financeiro</DialogTitle>
            <DialogDescription>
              Esta ação irá sincronizar todos os eventos da agenda com o módulo financeiro, 
              criando ou atualizando transações conforme necessário.
            </DialogDescription>
          </DialogHeader>
          
          {resultados && (
            <div className="my-4 p-3 border rounded">
              <h3 className="font-medium mb-2">Resultados da Sincronização:</h3>
              <p>Total de eventos: <strong>{resultados.total}</strong></p>
              <p>Sincronizados com sucesso: <strong className="text-green-600">{resultados.sucessos}</strong></p>
              <p>Falhas na sincronização: <strong className="text-red-600">{resultados.falhas}</strong></p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSincronizar} 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Confirmar Sincronização
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SincronizarEventosButton; 