import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, WrenchIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { corrigirEventosFinanceiros } from '@/utils/fixEventsFinancialData';
import { useQueryClient } from '@tanstack/react-query';

interface FixEventsButtonProps {
  onSuccess?: () => void;
  className?: string;
}

/**
 * Botão para corrigir eventos que não têm transações financeiras associadas
 */
const FixEventsButton: React.FC<FixEventsButtonProps> = ({ onSuccess, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleFixEvents = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para corrigir eventos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const eventosCorridos = await corrigirEventosFinanceiros(user.id);
      
      // ✅ CORREÇÃO: Usar query keys consistentes com userId
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['eventos'] });
        queryClient.invalidateQueries({ queryKey: ['financeiro-resumo', user.id] });
        queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes', user.id] });
        
        // Aguardar um pouco e fazer refetch para garantir dados atualizados
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['financeiro-resumo', user.id] });
          queryClient.refetchQueries({ queryKey: ['financeiro-transacoes', user.id] });
        }, 500);
      }
      
      toast({
        title: "Eventos corrigidos",
        description: `${eventosCorridos} eventos foram corrigidos com sucesso.`
      });
      
      // Chamar callback de sucesso, se fornecido
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao corrigir eventos:', error);
      toast({
        title: "Erro",
        description: "Houve um erro ao tentar corrigir os eventos. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFixEvents} 
      disabled={isLoading}
      variant="outline"
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Corrigindo...
        </>
      ) : (
        <>
          <WrenchIcon className="mr-2 h-4 w-4" />
          Corrigir Eventos
        </>
      )}
    </Button>
  );
};

export default FixEventsButton; 