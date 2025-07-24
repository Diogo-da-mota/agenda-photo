const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function regenerateTypes() {
  console.log('🔄 Regenerando tipos TypeScript do Supabase...');
  
  try {
    // Verificar se o arquivo supabase CLI está disponível
    const checkCommand = 'npx supabase --version';
    exec(checkCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Supabase CLI não encontrado:', error);
        console.log('📦 Instalando Supabase CLI...');
        
        const installCommand = 'npm install -g supabase';
        exec(installCommand, (installError, installStdout, installStderr) => {
          if (installError) {
            console.error('❌ Erro ao instalar Supabase CLI:', installError);
            return;
          }
          
          console.log('✅ Supabase CLI instalado com sucesso!');
          generateTypes();
        });
      } else {
        console.log('✅ Supabase CLI encontrado:', stdout.trim());
        generateTypes();
      }
    });
  } catch (error) {
    console.error('❌ Erro ao verificar Supabase CLI:', error);
  }
}

function generateTypes() {
  console.log('🔄 Gerando tipos TypeScript...');
  
  const command = 'npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts';
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro ao gerar tipos:', error);
      console.log('📝 Instruções manuais:');
      console.log('1. Acesse https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api');
      console.log('2. Copie o Project ID');
      console.log('3. Execute: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts');
      return;
    }
    
    console.log('✅ Tipos TypeScript regenerados com sucesso!');
    console.log('📄 Arquivo atualizado: src/integrations/supabase/types.ts');
    
    // Verificar se o arquivo foi criado corretamente
    const typesFile = path.join(__dirname, '../src/integrations/supabase/types.ts');
    if (fs.existsSync(typesFile)) {
      const stats = fs.statSync(typesFile);
      console.log(`📊 Tamanho do arquivo: ${stats.size} bytes`);
      console.log(`📅 Última modificação: ${stats.mtime.toLocaleString()}`);
    }
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  regenerateTypes();
}

module.exports = { regenerateTypes }; 