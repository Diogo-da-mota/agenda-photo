// Script para verificar a estrutura da tabela fotos_drive
import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('Verificando estrutura da tabela fotos_drive...');
  
  try {
    // Verificar se a tabela existe e sua estrutura
    const { data, error } = await supabase
      .from('fotos_drive')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro ao acessar a tabela:', error);
      return;
    } else {
      console.log('Tabela fotos_drive encontrada.');
    }
    
    // Acessar a estrutura da tabela usando o recurso de descrição da tabela
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
      console.error('Erro ao consultar estrutura da tabela:', tableError);
      
      // Se não conseguir usar o execute_sql, vamos verificar a estrutura através do tipo dos dados retornados
      if (data && data.length > 0) {
        console.log('\nInferindo estrutura da tabela a partir dos dados retornados:');
        const sampleData = data[0];
        
        for (const [key, value] of Object.entries(sampleData)) {
          const type = typeof value;
          console.log(`- Campo '${key}': Tipo inferido: ${type}, Valor de exemplo: ${value}`);
        }
      }
      return;
    }
    
    console.log('\nEstrutura atual da tabela fotos_drive:');
    tableData.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type}${column.is_nullable === 'YES' ? ', nullable' : ''}${column.column_default ? `, default: ${column.column_default}` : ''})`);
    });
    
    // Verificar se os campos esperados existem com os tipos corretos
    const requiredColumns = {
      'id': 'uuid',
      'usuario_id': 'uuid',
      'nome_pasta': 'text',
      'fotos': 'ARRAY',
      'created_at': 'timestamp with time zone'
    };
    
    const existingColumns = tableData.reduce((acc, col) => {
      acc[col.column_name] = col.data_type;
      return acc;
    }, {});
    
    console.log('\nVerificação dos campos esperados:');
    
    let allFieldsCorrect = true;
    
    for (const [colName, expectedType] of Object.entries(requiredColumns)) {
      const exists = existingColumns[colName] !== undefined;
      const typeMatches = exists && 
        (existingColumns[colName] === expectedType || 
         (expectedType === 'ARRAY' && existingColumns[colName].includes('ARRAY')));
      
      console.log(`- Campo '${colName}': ${exists ? 'Existe' : 'Não existe'}${exists ? `, Tipo: ${existingColumns[colName]}` : ''} ${typeMatches ? '✅' : '❌'}`);
      
      if (!exists || !typeMatches) {
        allFieldsCorrect = false;
      }
    }
    
    console.log('\nResultado final:');
    if (allFieldsCorrect) {
      console.log('✅ A tabela fotos_drive está configurada corretamente!');
    } else {
      console.log('❌ A tabela fotos_drive NÃO está configurada conforme esperado.');
      console.log('\n⚠️ ATENÇÃO: É necessário executar a migração para aplicar as alterações:');
      console.log('npx supabase migration up');
    }
    
  } catch (error) {
    console.error('Erro ao executar verificação:', error);
  }
}

checkTableStructure(); 