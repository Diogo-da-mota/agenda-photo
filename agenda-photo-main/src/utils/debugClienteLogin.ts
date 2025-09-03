import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dados do cliente para teste
const clienteTestData = {
  nome: 'Talytta Schulze Neves',
  cpfFormatado: '700.469.101-23',
  cpfSemFormatacao: '70046910123',
  tituloCompleto: '2 Talytta Schulze Neves'
};

async function debugClienteLogin() {
  // Debug do login do cliente - logs removidos para produção

  try {
    // 1. Buscar todos os registros que contenham 'Talytta' no título - logs removidos para produção
    const { data: registrosTalytta, error: errorTalytta } = await supabase
      .from('agenda_eventos')
      .select('*')
      .ilike('titulo', '%Talytta%');

    if (errorTalytta) {
      // Erro ao buscar registros - logs removidos para produção
    } else {
      // Registros encontrados - logs removidos para produção
    }

    // 2. Verificar registro com CPF sem formatação - logs removidos para produção
    const { data: registrosCpfSem, error: errorCpfSem } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cpf_cliente', clienteTestData.cpfSemFormatacao);

    if (errorCpfSem) {
      // Erro ao buscar por CPF sem formatação - logs removidos para produção
    } else {
      // Registros encontrados com CPF sem formatação - logs removidos para produção
    }

    // 3. Verificar registro com CPF formatado - logs removidos para produção
    const { data: registrosCpfCom, error: errorCpfCom } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cpf_cliente', clienteTestData.cpfFormatado);

    if (errorCpfCom) {
      // Erro ao buscar por CPF formatado - logs removidos para produção
    } else {
      // Registros encontrados com CPF formatado - logs removidos para produção
    }

    // 4. Testar a consulta exata que está falhando (como no contexto de autenticação) - logs removidos para produção
    
    const { data: consultaExata, error: errorConsultaExata } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, cpf_cliente, telefone, endereco_cliente')
      .eq('cpf_cliente', clienteTestData.cpfSemFormatacao)
      .ilike('titulo', `%${clienteTestData.tituloCompleto}%`);

    if (errorConsultaExata) {
      // Erro na consulta exata - logs removidos para produção
    } else {
      // Consulta exata executada - logs removidos para produção
    }

    // 5. Testar variações da consulta - logs removidos para produção
    
    // Variação 1: Apenas por título - logs removidos para produção
    const { data: apenasTitle, error: errorApenasTitle } = await supabase
      .from('agenda_eventos')
      .select('*')
      .ilike('titulo', `%${clienteTestData.tituloCompleto}%`);

    if (errorApenasTitle) {
      // Erro na busca por título - logs removidos para produção
    } else {
      // Busca por título executada - logs removidos para produção
    }

    // Variação 2: Apenas por CPF - logs removidos para produção
    const { data: apenasCpf, error: errorApenasCpf } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cpf_cliente', clienteTestData.cpfSemFormatacao);

    if (errorApenasCpf) {
      // Erro na busca por CPF - logs removidos para produção
    } else {
      // Busca por CPF executada - logs removidos para produção
    }

    // 6. Verificar políticas RLS - logs removidos para produção
    
    // Tentar uma consulta simples para verificar se RLS está bloqueando
    const { data: consultaSimples, error: errorConsultaSimples } = await supabase
      .from('agenda_eventos')
      .select('count')
      .limit(1);

    if (errorConsultaSimples) {
      // Erro na consulta simples - logs removidos para produção
    } else {
      // Consulta simples executada - logs removidos para produção
    }

    // 7. Mostrar estrutura dos dados encontrados - logs removidos para produção
    if (registrosTalytta && registrosTalytta.length > 0) {
      // Estrutura do registro encontrado - logs removidos para produção
    }

    // Debug concluído - logs removidos para produção

  } catch (error) {
    // Erro geral durante o debug - logs removidos para produção
  }
}

// Executar o debug
debugClienteLogin();

export { debugClienteLogin };