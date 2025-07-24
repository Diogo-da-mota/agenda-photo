// Script para verificar a estrutura atual da tabela fotos_drive
import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentStructure() {
  console.log('Verificando estrutura atual da tabela fotos_drive...');
  
  try {
    // Verificar se a tabela existe
    const { data, error } = await supabase
      .from('fotos_drive')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro ao acessar a tabela:', error);
      return;
    }
    
    // Verificar a estrutura diretamente a partir dos dados retornados
    if (data && data.length > 0) {
      console.log('\nEstrutura inferida a partir dos dados da tabela:');
      const sampleData = data[0];
      
      console.log('Campos encontrados:');
      for (const [key, value] of Object.entries(sampleData)) {
        const type = typeof value;
        const valuePreview = value !== null ? 
          (type === 'object' ? JSON.stringify(value).substring(0, 30) + '...' : String(value).substring(0, 30)) : 
          'null';
        console.log(`- ${key}: ${type}, Exemplo: ${valuePreview}`);
      }
    } else {
      console.log('A tabela está vazia ou não foi possível acessar os dados.');
      
      // Tentar obter a estrutura via execute_sql
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
      } else if (tableData && tableData.length > 0) {
        console.log('\nEstrutura atual da tabela fotos_drive:');
        tableData.forEach(column => {
          console.log(`- ${column.column_name} (${column.data_type}${column.is_nullable === 'YES' ? ', nullable' : ''}${column.column_default ? `, default: ${column.column_default}` : ''})`);
        });
      } else {
        console.log('Não foi possível obter a estrutura da tabela.');
      }
    }
    
    console.log('\n⚠️ ATENÇÃO: Para aplicar a nova estrutura, execute:');
    console.log('npx supabase migration up');
    
  } catch (error) {
    console.error('Erro ao executar verificação:', error);
  }
}

checkCurrentStructure(); 