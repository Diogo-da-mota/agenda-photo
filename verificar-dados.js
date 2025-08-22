import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'Não encontrada');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'Configurada' : 'Não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verificarDados() {
  console.log('🔍 VERIFICAÇÃO URGENTE DOS DADOS - AGENDA_EVENTOS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Contar total de registros
    console.log('\n📊 1. CONTAGEM TOTAL DE REGISTROS:');
    const { count, error: countError } = await supabase
      .from('agenda_eventos')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar registros:', countError.message);
    } else {
      console.log(`✅ Total de registros na tabela: ${count}`);
    }

    // 2. Listar todos os registros com títulos e CPFs
    console.log('\n📋 2. TODOS OS REGISTROS EXISTENTES:');
    const { data: allRecords, error: allError } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, cpf_cliente, data_inicio, status, telefone')
      .order('id', { ascending: true });
    
    if (allError) {
      console.error('❌ Erro ao buscar registros:', allError.message);
    } else {
      console.log(`✅ Encontrados ${allRecords.length} registros:`);
      allRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}`);
        console.log(`      Título: ${record.titulo}`);
        console.log(`      CPF: ${record.cpf_cliente || 'Não informado'}`);
        console.log(`      Data: ${record.data_inicio}`);
        console.log(`      Status: ${record.status}`);
        console.log(`      Telefone: ${record.telefone || 'Não informado'}`);
        console.log('      ---');
      });
    }

    // 3. Verificar registros com 'Talytta' no título
    console.log('\n🔍 3. REGISTROS COM "TALYTTA" NO TÍTULO:');
    const { data: talyttaRecords, error: talyttaError } = await supabase
      .from('agenda_eventos')
      .select('*')
      .ilike('titulo', '%talytta%');
    
    if (talyttaError) {
      console.error('❌ Erro ao buscar registros com Talytta:', talyttaError.message);
    } else {
      console.log(`✅ Encontrados ${talyttaRecords.length} registros com 'Talytta':`);
      talyttaRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}`);
        console.log(`      Título: ${record.titulo}`);
        console.log(`      CPF: ${record.cpf_cliente}`);
        console.log(`      Data: ${record.data_inicio}`);
        console.log(`      Telefone: ${record.telefone}`);
        console.log(`      Endereço: ${record.endereco_cliente}`);
        console.log('      ---');
      });
    }

    // 4. Verificar CPF específico
    console.log('\n🔍 4. VERIFICAÇÃO DO CPF ESPECÍFICO (700.469.101-23):');
    const { data: cpfRecords, error: cpfError } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cpf_cliente', '700.469.101-23');
    
    if (cpfError) {
      console.error('❌ Erro ao buscar CPF específico:', cpfError.message);
    } else {
      console.log(`✅ Encontrados ${cpfRecords.length} registros com CPF 700.469.101-23:`);
      cpfRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}`);
        console.log(`      Título: ${record.titulo}`);
        console.log(`      Data: ${record.data_inicio}`);
        console.log(`      Status: ${record.status}`);
        console.log('      ---');
      });
    }

    // 5. Listar todos os CPFs únicos
    console.log('\n📋 5. TODOS OS CPFs ÚNICOS NA TABELA:');
    const { data: uniqueCpfs, error: cpfListError } = await supabase
      .from('agenda_eventos')
      .select('cpf_cliente')
      .not('cpf_cliente', 'is', null);
    
    if (cpfListError) {
      console.error('❌ Erro ao buscar CPFs:', cpfListError.message);
    } else {
      const cpfSet = new Set(uniqueCpfs.map(r => r.cpf_cliente));
      console.log(`✅ CPFs únicos encontrados (${cpfSet.size}):`);
      Array.from(cpfSet).sort().forEach((cpf, index) => {
        console.log(`   ${index + 1}. ${cpf}`);
      });
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ VERIFICAÇÃO CONCLUÍDA - NENHUM DADO FOI ALTERADO');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Erro geral na verificação:', error.message);
  }
}

verificarDados();