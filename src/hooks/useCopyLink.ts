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
    let link: string;
    
    if (typeof contractDataOrId === 'object' && contractDataOrId.id_amigavel && contractDataOrId.nome_cliente) {
      // Usar novo formato com dados completos
      link = `${window.location.origin}${generateContractUrl(contractDataOrId)}`;
    } else {
      // Fallback para formato antigo
      link = `${window.location.origin}${generateContractUrl(contractDataOrId as string | number, contractTitle)}`;
    }
    
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
  }

  return { copyContractLink };
};