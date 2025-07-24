
import { supabase } from "@/lib/supabase";

// Exportando a função signIn para ser usada em outros arquivos
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Erro no login:", error);
    return { data: null, error };
  }
}
