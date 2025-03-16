
import { supabase } from "@/integrations/supabase/client";

interface TesteLog {
  timestamp: string;
  tipo: 'requisicao' | 'resposta' | 'erro';
  dados: any;
  status?: 'sucesso' | 'falha';
  mensagem?: string;
}

// Array para armazenar o histórico de logs dos testes
const historicoTestes: TesteLog[] = [];

/**
 * Registra uma entrada no log de testes
 */
function registrarLog(tipo: 'requisicao' | 'resposta' | 'erro', dados: any, status?: 'sucesso' | 'falha', mensagem?: string): void {
  const log: TesteLog = {
    timestamp: new Date().toISOString(),
    tipo,
    dados,
    status,
    mensagem
  };
  
  historicoTestes.push(log);
  console.log(`📋 [${log.tipo.toUpperCase()}]${status ? ` [${status.toUpperCase()}]` : ''}:`, log);
}

/**
 * Retorna o histórico completo de logs dos testes
 */
export function obterHistoricoTestes() {
  return [...historicoTestes];
}

/**
 * Limpa o histórico de logs dos testes
 */
export function limparHistoricoTestes() {
  historicoTestes.length = 0;
  return { success: true, message: 'Histórico de logs limpo com sucesso' };
}

/**
 * Gera um relatório com base nos logs armazenados
 */
export function gerarRelatorio() {
  const totalTestes = historicoTestes.filter(log => log.tipo === 'requisicao').length;
  const sucessos = historicoTestes.filter(log => log.status === 'sucesso').length;
  const falhas = historicoTestes.filter(log => log.status === 'falha').length;
  
  const ultimosErros = historicoTestes
    .filter(log => log.status === 'falha')
    .slice(-5)
    .map(log => ({
      timestamp: log.timestamp,
      mensagem: log.mensagem,
      dados: log.dados
    }));
    
  return {
    estatisticas: {
      totalTestes,
      sucessos,
      falhas,
      taxaSucesso: totalTestes > 0 ? (sucessos / totalTestes * 100).toFixed(2) + '%' : 'N/A'
    },
    ultimosErros,
    historicoCompleto: historicoTestes
  };
}

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
  registrarLog('requisicao', dadosTeste);

  try {
    // Usando o cliente Supabase com headers explícitos para garantir autenticação
    const { data, error } = await supabase
      .from('mensagens_de_contato')
      .insert(dadosTeste)
      .select();

    if (error) {
      console.error("❌ Erro ao enviar para Supabase:", error);
      registrarLog('erro', error, 'falha', error.message);
      
      // Log more detailed error information
      if (error.code) {
        console.error(`Error code: ${error.code}, Error message: ${error.message}, Error details:`, error.details);
      }
      
      return { success: false, error, timestamp: new Date().toISOString() };
    }

    console.log("✅ Resposta do Supabase:", data);
    registrarLog('resposta', data, 'sucesso', 'Dados enviados com sucesso');
    return { success: true, data, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("❌ Erro ao enviar para Supabase:", error);
    registrarLog('erro', error, 'falha', 'Exceção ao enviar dados');
    return { success: false, error, timestamp: new Date().toISOString() };
  }
}

/**
 * Função para capturar e testar os dados do formulário de pesquisa antes de enviar
 * @param formData Dados do formulário preenchido
 */
export async function testarEnvioFormulario(formData: any) {
  console.log("📝 Dados do formulário capturados:", formData);
  registrarLog('requisicao', formData);
  
  // Formatação dos dados para o formato esperado pelo Supabase
  const dadosFormatados = {
    nome: formData.nome || "Nome não fornecido",
    e_mail: formData.email || formData.e_mail || "email@exemplo.com",
    telefone: formData.telefone || formData.phone || "Não fornecido",
    mensagem: formData.mensagem || formData.message || JSON.stringify(formData)
  };
  
  console.log("🔄 Dados formatados para envio:", dadosFormatados);
  registrarLog('requisicao', dadosFormatados, undefined, 'Dados formatados para envio');
  
  // Tenta enviar os dados para o Supabase com headers explícitos
  try {
    const { data, error } = await supabase
      .from('mensagens_de_contato')
      .insert(dadosFormatados)
      .select();
      
    if (error) {
      console.error("❌ Erro ao enviar para Supabase:", error);
      
      // Log more detailed error information
      if (error.code) {
        console.error(`Error code: ${error.code}, Error message: ${error.message}, Error details:`, error.details);
      }
      
      registrarLog('erro', error, 'falha', error.message);
      return { success: false, error, timestamp: new Date().toISOString() };
    }
    
    console.log("✅ Dados enviados com sucesso:", data);
    registrarLog('resposta', data, 'sucesso', 'Dados enviados com sucesso');
    return { success: true, data, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("❌ Exceção ao enviar para Supabase:", error);
    registrarLog('erro', error, 'falha', 'Exceção ao enviar dados');
    return { success: false, error, timestamp: new Date().toISOString() };
  }
}

// Adicione uma função de teste direto com API keys para depuração
export async function testarEnvioComApiKeys(dados?: any) {
  const dadosTeste = dados || {
    nome: "Teste API Keys",
    e_mail: "teste-api@lovable.com",
    telefone: "999999999",
    mensagem: "Teste de envio com API keys explícitas",
  };

  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ3N3c3ZyeXd5dm1mZmdvenBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjI3NDIsImV4cCI6MjA1NzYzODc0Mn0.LBeo7mmw30uX1HTF4_IN0HvjJjKy5IlDHQKQV7lVhPk";
  const apiUrl = "https://rggswsvrywyvmffgozpj.supabase.co/rest/v1/mensagens_de_contato";

  console.log("📤 Testando envio com fetch API e API keys explícitas:", dadosTeste);
  registrarLog('requisicao', dadosTeste);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dadosTeste)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erro ao enviar para Supabase via fetch:", errorData);
      registrarLog('erro', errorData, 'falha', `HTTP error ${response.status}: ${response.statusText}`);
      return { success: false, error: errorData, timestamp: new Date().toISOString() };
    }

    const data = await response.json();
    console.log("✅ Resposta do Supabase via fetch:", data);
    registrarLog('resposta', data, 'sucesso', 'Dados enviados com sucesso via fetch API');
    return { success: true, data, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("❌ Exceção ao enviar para Supabase via fetch:", error);
    registrarLog('erro', error, 'falha', 'Exceção ao enviar dados via fetch API');
    return { success: false, error, timestamp: new Date().toISOString() };
  }
}
