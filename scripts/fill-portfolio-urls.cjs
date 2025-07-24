// Script para atualizar as URLs nos trabalhos do portfólio
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

// URLs de exemplo para testes
const urlsExemplo = [
  "https://drive.google.com/file/d/1abcdefghijklmnopqrstuvwxyz/view",
  "https://drive.google.com/file/d/2abcdefghijklmnopqrstuvwxyz/view",
  "https://drive.google.com/file/d/3abcdefghijklmnopqrstuvwxyz/view",
  "https://drive.google.com/file/d/4abcdefghijklmnopqrstuvwxyz/view"
];

// Imagens de exemplo (opcional)
const imagensExemplo = [
  "https://utfs.io/f/4c2815c6-3a51-4f9d-b961-599595ac919b-1j9ayv.png",
  "https://utfs.io/f/7b2815c6-3a51-4f9d-b961-599595ac919b-2j9ayv.png",
  "https://utfs.io/f/9c2815c6-3a51-4f9d-b961-599595ac919b-3j9ayv.png"
];

async function atualizarUrlsPortfolio() {
  console.log('Iniciando atualização das URLs nos trabalhos do portfólio...');
  
  try {
    // 1. Buscar todos os trabalhos
    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar trabalhos:', error);
      return;
    }
    
    console.log(`✓ Encontrados ${data.length} trabalhos no portfólio.`);
    
    // 2. Atualizar cada trabalho
    let atualizados = 0;
    
    for (const trabalho of data) {
      // Gerar URLs aleatórias
      const quantidadeUrls = Math.floor(Math.random() * 5) + 1; // 1 a 5 URLs
      const urlsAleatorias = urlsExemplo.slice(0, quantidadeUrls);
      
      // Selecionar uma URL principal
      const urlPrincipal = urlsAleatorias[0];
      
      // Fazer update no banco
      const { error: updateError } = await supabase
        .from('portfolio_trabalhos')
        .update({
          urls_drive: urlsAleatorias,
          url_imagem_drive: urlPrincipal,
          imagens: imagensExemplo.slice(0, quantidadeUrls)
        })
        .eq('id', trabalho.id);
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar trabalho ${trabalho.id}:`, updateError);
      } else {
        atualizados++;
        console.log(`✓ Trabalho ${trabalho.id} (${trabalho.titulo}) atualizado com ${quantidadeUrls} URLs.`);
      }
    }
    
    console.log(`\n✅ Processo concluído! ${atualizados} de ${data.length} trabalhos atualizados.`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

atualizarUrlsPortfolio(); 