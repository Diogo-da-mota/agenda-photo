// Script para verificar a configuração das tabelas após a migração
import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelas() {
  // console.log('==== VERIFICAÇÃO DAS TABELAS ===='); // Removido para produção
  
  try {
    // 1. Verificar a tabela fotos_drive
    await verificarTabelaFotosDrive();
    
    // 2. Verificar a tabela portfolio_trabalhos
    await verificarTabelaPortfolioTrabalhos();
    
    // console.log('\n==== RESUMO ===='); // Removido para produção
    // console.log('✅ Verificação concluída. Para aplicar as migrações, execute:'); // Removido para produção
    // console.log('npx supabase migration up'); // Removido para produção
    
  } catch (error) {
    // console.error('❌ Erro na verificação:', error); // Removido para produção
  }
}

async function verificarTabelaFotosDrive() {
  // console.log('\n1. Verificando tabela fotos_drive...'); // Removido para produção
  
  try {
    // Verificar se a tabela existe
    const { data, error } = await supabase
      .from('fotos_drive')
      .select('*')
      .limit(1);
    
    if (error) {
      // console.error('❌ Erro ao acessar a tabela fotos_drive:', error); // Removido para produção
      return;
    }
    
    // console.log('✓ Tabela fotos_drive existe'); // Removido para produção
    
    // Verificar estrutura
    const { data: tableData, error: tableError } = await supabase
      .rpc('execute_sql', {
        statement: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default
          FROM 
            information_schema.columns 
          WHERE 
            table_name = 'fotos_drive' 
            AND table_schema = 'public'
          ORDER BY 
            ordinal_position;
        `
      });
    
    if (tableError) {
      // console.error('❌ Erro ao consultar estrutura da tabela fotos_drive:', tableError); // Removido para produção
      return;
    }
    
    // Campos esperados
    const camposEsperados = {
      'id': 'uuid',
      'usuario_id': 'uuid',
      'nome_pasta': 'text',
      'fotos': 'ARRAY',
      'created_at': 'timestamp with time zone'
    };
    
    const camposExistentes = tableData.reduce((acc, col) => {
      acc[col.column_name] = col.data_type;
      return acc;
    }, {});
    
    // console.log('\nCampos da tabela fotos_drive:'); // Removido para produção
    
    let todosCamposCorretos = true;
    
    Object.entries(camposEsperados).forEach(([nome, tipo]) => {
      const existe = camposExistentes[nome] !== undefined;
      const tipoCorreto = existe && 
        (camposExistentes[nome] === tipo || 
         (tipo === 'ARRAY' && camposExistentes[nome].includes('ARRAY')));
      
      // console.log(`- ${nome}: ${existe ? (tipoCorreto ? '✅' : '❌ (tipo incorreto)') : '❌ (ausente)'}`);
      
      if (!existe || !tipoCorreto) {
        todosCamposCorretos = false;
      }
    });
    
    if (todosCamposCorretos) {
      // console.log('\n✅ Tabela fotos_drive está configurada corretamente'); // Removido para produção
    } else {
      // console.log('\n❌ Tabela fotos_drive NÃO está configurada corretamente'); // Removido para produção
    }
    
  } catch (error) {
    // console.error('❌ Erro ao verificar tabela fotos_drive:', error); // Removido para produção
  }
}

async function verificarTabelaPortfolioTrabalhos() {
  // console.log('\n2. Verificando tabela portfolio_trabalhos...'); // Removido para produção
  
  try {
    // Verificar se a tabela existe
    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .select('*')
      .limit(1);
    
    if (error) {
      // console.error('❌ Erro ao acessar a tabela portfolio_trabalhos:', error); // Removido para produção
      return;
    }
    
    // console.log('✓ Tabela portfolio_trabalhos existe'); // Removido para produção
    
    // Verificar se existem registros
    const { count, error: countError } = await supabase
      .from('portfolio_trabalhos')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      // console.error('❌ Erro ao contar registros:', countError); // Removido para produção
    } else {
      // console.log(`✓ A tabela portfolio_trabalhos contém ${count} registros`); // Removido para produção
    }
    
    // Verificar campos específicos
    const { data: tableData, error: tableError } = await supabase
      .rpc('execute_sql', {
        statement: `
          SELECT 
            column_name 
          FROM 
            information_schema.columns 
          WHERE 
            table_name = 'portfolio_trabalhos' 
            AND table_schema = 'public'
            AND column_name IN ('imagens', 'imagem_capa');
        `
      });
    
    if (tableError) {
      // console.error('❌ Erro ao consultar estrutura da tabela portfolio_trabalhos:', tableError); // Removido para produção
      return;
    }
    
    const camposExistentes = tableData.map(col => col.column_name);
    
    // console.log('\nVerificando campos necessários:'); // Removido para produção
          // console.log(`- imagens: ${camposExistentes.includes('imagens') ? '✅' : '❌ (ausente)'}`);
      // console.log(`- imagem_capa: ${camposExistentes.includes('imagem_capa') ? '✅' : '❌ (ausente)'}`);
      
      if (camposExistentes.includes('imagens') && camposExistentes.includes('imagem_capa')) {
      // console.log('\n✅ Tabela portfolio_trabalhos contém os campos necessários'); // Removido para produção
    } else {
      // console.log('\n❌ Tabela portfolio_trabalhos NÃO contém todos os campos necessários'); // Removido para produção
    }
    
  } catch (error) {
    // console.error('❌ Erro ao verificar tabela portfolio_trabalhos:', error); // Removido para produção
  }
}

verificarTabelas();