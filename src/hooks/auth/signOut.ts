
import { supabase } from "@/lib/supabase";

// Exportando a função signOut para ser usada em outros arquivos
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return { error };
  }
}
