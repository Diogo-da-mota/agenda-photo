// Script para adicionar colunas ausentes na tabela portfolio_trabalhos
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

async function adicionarColunas() {
  console.log('Adicionando colunas ausentes à tabela portfolio_trabalhos...');
  
  try {
    // 1. Verificar se as colunas já existem
    const { data: colunasAtuais, error: erroConsulta } = await supabase.rpc('execute_sql', {
      statement: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'portfolio_trabalhos' 
        AND table_schema = 'public'
        AND column_name IN ('urls_drive', 'url_imagem_drive');
      `
    });

    if (erroConsulta) {
      console.error('❌ Erro ao consultar colunas existentes:', erroConsulta);
      return;
    }

    const colunasExistentes = colunasAtuais.map(c => c.column_name);
    console.log('Colunas existentes:', colunasExistentes);

    // 2. Adicionar coluna urls_drive se não existir
    if (!colunasExistentes.includes('urls_drive')) {
      console.log('Adicionando coluna urls_drive...');
      const { error: erroUrlsDrive } = await supabase.rpc('execute_sql', {
        statement: `
          ALTER TABLE public.portfolio_trabalhos 
          ADD COLUMN urls_drive TEXT[] DEFAULT '{}'::text[];
          
          COMMENT ON COLUMN public.portfolio_trabalhos.urls_drive 
          IS 'Array de URLs do Google Drive (mantido para compatibilidade)';
        `
      });

      if (erroUrlsDrive) {
        console.error('❌ Erro ao adicionar coluna urls_drive:', erroUrlsDrive);
      } else {
        console.log('✅ Coluna urls_drive adicionada com sucesso!');
      }
    } else {
      console.log('✓ Coluna urls_drive já existe.');
    }

    // 3. Adicionar coluna url_imagem_drive se não existir
    if (!colunasExistentes.includes('url_imagem_drive')) {
      console.log('Adicionando coluna url_imagem_drive...');
      const { error: erroUrlImagemDrive } = await supabase.rpc('execute_sql', {
        statement: `
          ALTER TABLE public.portfolio_trabalhos 
          ADD COLUMN url_imagem_drive TEXT;
          
          COMMENT ON COLUMN public.portfolio_trabalhos.url_imagem_drive 
          IS 'URL principal da imagem no Google Drive (mantido para compatibilidade)';
        `
      });

      if (erroUrlImagemDrive) {
        console.error('❌ Erro ao adicionar coluna url_imagem_drive:', erroUrlImagemDrive);
      } else {
        console.log('✅ Coluna url_imagem_drive adicionada com sucesso!');
      }
    } else {
      console.log('✓ Coluna url_imagem_drive já existe.');
    }

    console.log('\n✅ Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
  }
}

adicionarColunas(); 