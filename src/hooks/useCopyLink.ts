import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para copiar links de contratos
 * Centraliza a lógica de cópia e notificação, seguindo o princípio DRY
 */
export const useCopyLink = () => {
  const { toast } = useToast();

  const copyContractLink = (contractId: string | number) => {
    const link = `${window.location.origin}/contrato/${contractId}`;
    
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link copiado",
        description: "O link do contrato foi copiado para a área de transferência.",
      });
    }).catch((error) => {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    });
  };

  return { copyContractLink };
};