
import { supabase } from "@/lib/supabase";

// Interface para metadados do usuário
interface UserMetadata {
  nome?: string;
  telefone?: string;
  empresa?: string;
  [key: string]: unknown;
}

// Exportando a função signUp para ser usada em outros arquivos
export async function signUp(email: string, password: string, metadata?: UserMetadata) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return { data: null, error };
  }
}
