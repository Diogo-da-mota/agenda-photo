const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Substituições
  const replacements = [
    ['url_imagem_drive', 'imagem_capa'],
    ['urls_drive', 'imagens'],
  ];
  
  replacements.forEach(function(replacement) {
    var old_val = replacement[0];
    var new_val = replacement[1];
    if (content.includes(old_val)) {
      content = content.replace(new RegExp(old_val, 'g'), new_val);
      modified = true;
      console.log(`✅ Corrigido: ${filePath}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
  }
}

// Executar em todos os arquivos
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      replaceInFile(filePath);
    }
  });
}

walkDir('./src');
console.log('🎉 Correção concluída!'); 