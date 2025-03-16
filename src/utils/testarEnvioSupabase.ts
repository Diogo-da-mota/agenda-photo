
import { supabase } from "@/integrations/supabase/client";

/**
 * Função para testar o envio de dados para o Supabase
 */
export async function testarEnvioSupabase() {
  const dadosTeste = {
    nome: "Teste Lovable",
    e_mail: "teste@lovable.com",
    telefone: "999999999",
    mensagem: "Teste de envio pelo site",
  };

  console.log("📤 Enviando dados para o Supabase:", dadosTeste);

  try {
    // Usando o cliente Supabase para enviar os dados
    const { data, error } = await supabase
      .from('mensagens_de_contato')
      .insert(dadosTeste)
      .select();

    if (error) {
      console.error("❌ Erro ao enviar para Supabase:", error);
      return { success: false, error };
    }

    console.log("✅ Resposta do Supabase:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erro ao enviar para Supabase:", error);
    return { success: false, error };
  }
}

/**
 * Função para capturar e testar os dados do formulário de pesquisa antes de enviar
 * @param formData Dados do formulário preenchido
 */
export async function testarEnvioFormulario(formData: any) {
  console.log("📝 Dados do formulário capturados:", formData);
  
  // Formatação dos dados para o formato esperado pelo Supabase
  const dadosFormatados = {
    nome: formData.nome || "Nome não fornecido",
    e_mail: formData.email || formData.e_mail || "email@exemplo.com",
    telefone: formData.telefone || formData.phone || "Não fornecido",
    mensagem: formData.mensagem || formData.message || JSON.stringify(formData)
  };
  
  console.log("🔄 Dados formatados para envio:", dadosFormatados);
  
  // Tenta enviar os dados para o Supabase
  try {
    const { data, error } = await supabase
      .from('mensagens_de_contato')
      .insert(dadosFormatados)
      .select();
      
    if (error) {
      console.error("❌ Erro ao enviar para Supabase:", error);
      return { success: false, error };
    }
    
    console.log("✅ Dados enviados com sucesso:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Exceção ao enviar para Supabase:", error);
    return { success: false, error };
  }
}
