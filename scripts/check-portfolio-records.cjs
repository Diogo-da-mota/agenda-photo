// Script para verificar os registros da tabela portfolio_trabalhos
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarRegistros() {
  console.log('Verificando registros da tabela portfolio_trabalhos...');
  
  try {
    // Primeiro fazer login com o usuário criado
    console.log('Tentando fazer login com o usuário de teste...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'senha123'
    });
    
    if (authError) {
      console.error('❌ Erro ao fazer login:', authError.message);
      return;
    }
    
    console.log('✅ Login realizado com sucesso! User ID:', authData.user.id);
    
    // Agora consultar os registros como usuário autenticado
    const { data, error, count } = await supabase
      .from('portfolio_trabalhos')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Erro ao buscar registros:', error);
      return;
    }
    
    console.log(`✓ Total de registros: ${count || 0}`);
    
    if (data && data.length > 0) {
      console.log('\nRegistros encontrados:');
      data.forEach((registro, index) => {
        console.log(`\n--- Registro ${index + 1} ---`);
        console.log(`ID: ${registro.id}`);
        console.log(`Título: ${registro.titulo}`);
        console.log(`Categoria: ${registro.categoria}`);
        console.log(`URL imagem principal: ${registro.url_imagem_drive}`);
        
        // Verificar se a URL do Drive está presente
        if (registro.url_imagem_drive) {
          console.log('✅ URL de imagem principal definida corretamente');
        } else {
          console.log('❌ URL de imagem principal AUSENTE');
        }
        
        // Verificar se o array de URLs está presente
        if (registro.urls_drive && registro.urls_drive.length > 0) {
          console.log(`✅ Array de URLs definido corretamente (${registro.urls_drive.length} itens)`);
        } else {
          console.log('❌ Array de URLs AUSENTE ou VAZIO');
        }
      });
    } else {
      console.log('\n❌ Nenhum registro encontrado na tabela.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar registros:', error);
  }
}

verificarRegistros(); 