import { useToast } from '@/hooks/use-toast';
import { generateContractUrl } from '@/utils/slugify';

interface ContractUrlData {
  id_contrato: string;
  id_amigavel: number;
  nome_cliente: string;
}

/**
 * Hook personalizado para copiar links de contratos
 * Centraliza a lógica de cópia e notificação, seguindo o princípio DRY
 * Suporta tanto o novo formato quanto o formato legado
 */
export const useCopyLink = () => {
  const { toast } = useToast();

  // Sobrecarga para suportar ambos os formatos
  function copyContractLink(contractData: ContractUrlData): void;
  function copyContractLink(contractId: string | number, contractTitle?: string): void;
  function copyContractLink(
    contractDataOrId: ContractUrlData | string | number, 
    contractTitle?: string
  ): void {
    // Usar a mesma URL do botão "Ver Site" - /agenda/cliente-login
    const link = `${window.location.origin}/agenda/cliente-login`;
    
    navigator.clipboard.writeText(link).then(() => {
      
    }).catch((error) => {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    });
  }

  return { copyContractLink };
};