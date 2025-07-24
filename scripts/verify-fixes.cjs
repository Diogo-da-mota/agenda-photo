const fs = require('fs');
const path = require('path');

async function verifyFixes() {
  console.log('🔍 VERIFICANDO CORREÇÕES APLICADAS...\n');
  
  let allTestsPassed = true;
  const results = [];
  
  // TESTE 1: Verificar se tipos TypeScript foram corrigidos
  console.log('1. 🔷 Verificando tipos TypeScript...');
  try {
    const typesFile = path.join(__dirname, '../src/integrations/supabase/types.ts');
    const typesContent = fs.readFileSync(typesFile, 'utf8');
    
    const hasOldColumns = typesContent.includes('url_imagem_drive') || typesContent.includes('urls_drive');
    
    if (hasOldColumns) {
      console.log('   ❌ Tipos ainda contêm colunas antigas');
      results.push('❌ Tipos TypeScript - Colunas antigas encontradas');
      allTestsPassed = false;
    } else {
      console.log('   ✅ Tipos TypeScript corrigidos');
      results.push('✅ Tipos TypeScript - Colunas antigas removidas');
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar tipos:', error.message);
    results.push('❌ Tipos TypeScript - Erro na verificação');
    allTestsPassed = false;
  }
  
  // TESTE 2: Verificar se hook useUserRole foi corrigido
  console.log('\n2. 🎣 Verificando hook useUserRole...');
  try {
    const hookFile = path.join(__dirname, '../src/hooks/useUserRole.ts');
    const hookContent = fs.readFileSync(hookFile, 'utf8');
    
    const hasMaybeSingle = hookContent.includes('maybeSingle()');
    const hasSingle = hookContent.includes('.single()');
    
    if (hasMaybeSingle && !hasSingle) {
      console.log('   ✅ Hook useUserRole corrigido');
      results.push('✅ Hook useUserRole - Usando maybeSingle()');
    } else {
      console.log('   ❌ Hook useUserRole ainda usa single()');
      results.push('❌ Hook useUserRole - Ainda usando single()');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar hook:', error.message);
    results.push('❌ Hook useUserRole - Erro na verificação');
    allTestsPassed = false;
  }
  
  // TESTE 3: Verificar se script verify-tables foi corrigido
  console.log('\n3. 📋 Verificando script verify-tables...');
  try {
    const scriptFile = path.join(__dirname, 'verify-tables.js');
    const scriptContent = fs.readFileSync(scriptFile, 'utf8');
    
    const hasNewColumns = scriptContent.includes('imagens') && scriptContent.includes('imagem_capa');
    const hasOldColumns = scriptContent.includes('urls_drive') || scriptContent.includes('url_imagem_drive');
    
    if (hasNewColumns && !hasOldColumns) {
      console.log('   ✅ Script verify-tables corrigido');
      results.push('✅ Script verify-tables - Usando nomes corretos');
    } else {
      console.log('   ❌ Script verify-tables ainda usa nomes antigos');
      results.push('❌ Script verify-tables - Nomes antigos encontrados');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar script:', error.message);
    results.push('❌ Script verify-tables - Erro na verificação');
    allTestsPassed = false;
  }
  
  // TESTE 4: Verificar se queries estão usando nomes corretos
  console.log('\n4. 🔍 Verificando queries nos arquivos...');
  try {
    const filesToCheck = [
      '../src/hooks/usePortfolio.tsx',
      '../src/services/portfolio/queries/publicQueries.ts',
      '../src/services/portfolio/queries/basicQueries.ts'
    ];
    
    let hasProblems = false;
    
    for (const filePath of filesToCheck) {
      const fullPath = path.join(__dirname, filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('url_imagem_drive') || content.includes('urls_drive')) {
          console.log(`   ❌ Arquivo ${filePath} ainda usa colunas antigas`);
          hasProblems = true;
        }
      }
    }
    
    if (!hasProblems) {
      console.log('   ✅ Queries usando nomes corretos');
      results.push('✅ Queries - Usando nomes corretos das colunas');
    } else {
      console.log('   ❌ Algumas queries ainda usam nomes antigos');
      results.push('❌ Queries - Nomes antigos encontrados');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar queries:', error.message);
    results.push('❌ Queries - Erro na verificação');
    allTestsPassed = false;
  }
  
  // RESULTADO FINAL
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESULTADO FINAL:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(result);
  });
  
  if (allTestsPassed) {
    console.log('\n🎉 TODAS AS CORREÇÕES FORAM APLICADAS COM SUCESSO!');
    console.log('✅ Os erros de url_imagem_drive e urls_drive foram corrigidos');
    console.log('✅ O erro 406 do useUserRole foi corrigido');
    console.log('✅ O projeto está pronto para uso');
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Reinicie o servidor de desenvolvimento');
    console.log('2. Limpe o cache do navegador');
    console.log('3. Teste a rota /portfolio');
    console.log('4. Teste o login para verificar se não há mais erro 406');
  } else {
    console.log('\n⚠️  ALGUMAS CORREÇÕES PRECISAM DE ATENÇÃO');
    console.log('❌ Verifique os itens marcados com ❌ acima');
    console.log('📝 Execute as correções necessárias');
  }
  
  return allTestsPassed;
}

// Executar se chamado diretamente
if (require.main === module) {
  verifyFixes();
}

module.exports = { verifyFixes }; 