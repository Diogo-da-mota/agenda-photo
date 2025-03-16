
import { createContactMessagesTable } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Creates the contact_messages table
 * @param setTableExists Function to update table exists state
 * @param onSuccess Callback when table is created successfully
 * @param toast Toast function
 * @returns Promise<boolean> Whether the operation was successful
 */
export const createMessagesTable = async (
  setTableExists: (exists: boolean) => void,
  onSuccess: () => void,
  toast: ReturnType<typeof useToast>["toast"]
): Promise<boolean> => {
  try {
    const result = await createContactMessagesTable();
    
    if (result) {
      toast({
        title: "Sucesso",
        description: "Tabela criada com sucesso. Atualizando dados...",
      });
      
      setTableExists(true);
      onSuccess();
      return true;
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tabela. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    toast({
      title: "Erro",
      description: "Não foi possível criar a tabela. Tente novamente mais tarde.",
      variant: "destructive",
    });
    return false;
  }
};
