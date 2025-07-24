// Script de Debug - Análise de Inconsistência de Telefone
// Identifica diferenças na estrutura de dados entre clientes

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase (usar variáveis de ambiente em produção)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analisarInconsistenciaTelefone() {
  console.log('🔍 ANÁLISE DE INCONSISTÊNCIA DE TELEFONE - AGENDA PRO\n');
  
  try {
    // 1. Buscar todos os eventos da agenda
    console.log('📋 Buscando todos os eventos da agenda...');
    const { data: eventos, error: errorEventos } = await supabase
      .from('agenda_eventos')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (errorEventos) {
      console.error('❌ Erro ao buscar eventos:', errorEventos);
      return;
    }
    
    console.log(`✅ ${eventos.length} eventos encontrados\n`);
    
    // 2. Filtrar eventos específicos
    const clientesProblema = [
      'Agenda Pro',
      '8 Diogo G Mota',
      'Diogo G Mota'
    ];
    
    const eventosRelevantes = eventos.filter(evento => 
      clientesProblema.some(cliente => 
        evento.titulo && evento.titulo.toLowerCase().includes(cliente.toLowerCase())
      )
    );
    
    console.log(`🎯 ${eventosRelevantes.length} eventos relevantes encontrados:\n`);
    
    // 3. Analisar estrutura de cada evento
    const analise = [];
    
    for (const evento of eventosRelevantes) {
      const estrutura = {
        id: evento.id,
        titulo: evento.titulo,
        telefone_campo: evento.telefone,
        telefone_tipo: typeof evento.telefone,
        telefone_valor: evento.telefone,
        telefone_length: evento.telefone ? evento.telefone.length : 0,
        telefone_is_null: evento.telefone === null,
        telefone_is_undefined: evento.telefone === undefined,
        telefone_is_empty: evento.telefone === '',
        criado_em: evento.criado_em,
        atualizado_em: evento.atualizado_em,
        observacoes: evento.observacoes,
        descricao: evento.descricao,
        // Verificar se há telefone em outros campos
        campos_completos: Object.keys(evento),
        dados_completos: evento
      };
      
      analise.push(estrutura);
      
      console.log(`📞 CLIENTE: ${evento.titulo}`);
      console.log(`   ID: ${evento.id}`);
      console.log(`   Telefone: "${evento.telefone}" (${typeof evento.telefone})`);
      console.log(`   Telefone é null: ${evento.telefone === null}`);
      console.log(`   Telefone é undefined: ${evento.telefone === undefined}`);
      console.log(`   Telefone é string vazia: ${evento.telefone === ''}`);
      console.log(`   Criado em: ${evento.criado_em}`);
      console.log(`   Observações: ${evento.observacoes ? evento.observacoes.substring(0, 100) + '...' : 'Nenhuma'}`);
      console.log(`   Campos disponíveis: ${Object.keys(evento).join(', ')}`);
      console.log('   ---');
    }
    
    // 4. Buscar na tabela de clientes também
    console.log('\n👥 Buscando na tabela de clientes...');
    const { data: clientes, error: errorClientes } = await supabase
      .from('clientes')
      .select('*');
    
    if (!errorClientes && clientes) {
      const clientesRelevantes = clientes.filter(cliente => 
        clientesProblema.some(nome => 
          cliente.nome && cliente.nome.toLowerCase().includes(nome.toLowerCase())
        )
      );
      
      console.log(`👥 ${clientesRelevantes.length} clientes relevantes encontrados na tabela clientes:\n`);
      
      for (const cliente of clientesRelevantes) {
        console.log(`👤 CLIENTE: ${cliente.nome}`);
        console.log(`   ID: ${cliente.id}`);
        console.log(`   Telefone: "${cliente.telefone}" (${typeof cliente.telefone})`);
        console.log(`   Email: ${cliente.email}`);
        console.log(`   Criado em: ${cliente.created_at}`);
        console.log('   ---');
      }
    }
    
    // 5. Salvar relatório detalhado
    const relatorio = {
      timestamp: new Date().toISOString(),
      total_eventos: eventos.length,
      eventos_relevantes: eventosRelevantes.length,
      analise_detalhada: analise,
      clientes_tabela: clientesRelevantes || [],
      conclusoes: {
        agenda_pro: analise.find(a => a.titulo.toLowerCase().includes('agenda pro')),
        diogo_mota: analise.find(a => a.titulo.toLowerCase().includes('diogo'))
      }
    };
    
    fs.writeFileSync('debug-telefone-relatorio.json', JSON.stringify(relatorio, null, 2));
    console.log('\n📄 Relatório detalhado salvo em: debug-telefone-relatorio.json');
    
    // 6. Análise comparativa
    console.log('\n🔍 ANÁLISE COMPARATIVA:');
    const agendaPro = analise.find(a => a.titulo.toLowerCase().includes('agenda pro'));
    const diogoMota = analise.find(a => a.titulo.toLowerCase().includes('diogo'));
    
    if (agendaPro && diogoMota) {
      console.log('\n📊 COMPARAÇÃO DIRETA:');
      console.log(`Agenda Pro - Telefone: "${agendaPro.telefone_valor}" (${agendaPro.telefone_tipo})`);
      console.log(`Diogo Mota - Telefone: "${diogoMota.telefone_valor}" (${diogoMota.telefone_tipo})`);
      
      if (agendaPro.telefone_is_null && !diogoMota.telefone_is_null) {
        console.log('\n🎯 PROBLEMA IDENTIFICADO:');
        console.log('   - Agenda Pro tem telefone NULL');
        console.log('   - Diogo Mota tem telefone preenchido');
        console.log('   - Isso explica por que um preenche e outro não!');
      }
    }
    
    // 7. Verificar conversão de dados
    console.log('\n🔄 TESTANDO CONVERSÃO DE DADOS:');
    for (const evento of eventosRelevantes) {
      console.log(`\nEvento: ${evento.titulo}`);
      console.log(`Telefone original: "${evento.telefone}"`);
      console.log(`Telefone || '': "${evento.telefone || ''}"`);
      console.log(`Resultado da conversão: "${evento.telefone || ''}"`);
    }
    
  } catch (error) {
    console.error('💥 Erro durante análise:', error);
  }
}

// Executar análise
analisarInconsistenciaTelefone().then(() => {
  console.log('\n✅ Análise concluída!');
}).catch(error => {
  console.error('❌ Erro na execução:', error);
});