/**
 * Teste de Encoding de Emojis
 * Verifica se os emojis estão sendo codificados corretamente para WhatsApp
 */

import { processEmojisForWhatsApp, encodeTextWithEmojisForURL } from './emojiUtils';

// Emojis em diferentes formatos para teste
const emojiTests = {
  // Emojis diretos (problemáticos)
  direct: {
    checkMark: '✅',
    clipboard: '📋',
    moneyBag: '💰',
    calendar: '📅',
    receipt: '🧾',
    camera: '📸',
    party: '🎉',
    link: '🔗'
  },
  
  // Emojis em Unicode escape sequences (mais robustos)
  unicode: {
    checkMark: '\u2705',
    clipboard: '\u{1F4CB}',
    moneyBag: '\u{1F4B0}',
    calendar: '\u{1F4C5}',
    receipt: '\u{1F9FE}',
    camera: '\u{1F4F8}',
    party: '\u{1F389}',
    link: '\u{1F517}'
  }
};

// Mensagem de teste com emojis diretos
const mensagemComEmojisDiretos = `Olá João!

Confirmamos o recebimento do seu pagamento! ✅

📋 Detalhes do pagamento:
💰 Valor: R$ 500,00
📅 Data: 15/01/2024
📋 Referente: Sessão de fotos
🧾 Comprovante: #2024001

Obrigado pela confiança!

Bright Spark Studio
(11)9 9999-9999`;

// Mensagem de teste com emojis Unicode
const mensagemComEmojisUnicode = `Olá João!

Confirmamos o recebimento do seu pagamento! \u2705

\u{1F4CB} Detalhes do pagamento:
\u{1F4B0} Valor: R$ 500,00
\u{1F4C5} Data: 15/01/2024
\u{1F4CB} Referente: Sessão de fotos
\u{1F9FE} Comprovante: #2024001

Obrigado pela confiança!

Bright Spark Studio
(11)9 9999-9999`;

/**
 * Testa o encoding de emojis em diferentes formatos
 */
export const testarEncodingEmojis = () => {
  console.log('🧪 TESTE DE ENCODING DE EMOJIS');
  console.log('================================');
  
  // Teste 1: Emojis diretos
  console.log('\n1. TESTE COM EMOJIS DIRETOS:');
  console.log('Mensagem original:', mensagemComEmojisDiretos);
  
  const processadaDireta = processEmojisForWhatsApp(mensagemComEmojisDiretos);
  console.log('Após processEmojisForWhatsApp:', processadaDireta);
  
  const encodedDireta = encodeTextWithEmojisForURL(processadaDireta);
  console.log('Após encodeTextWithEmojisForURL:', encodedDireta);
  
  // Teste 2: Emojis Unicode
  console.log('\n2. TESTE COM EMOJIS UNICODE:');
  console.log('Mensagem original:', mensagemComEmojisUnicode);
  
  const processadaUnicode = processEmojisForWhatsApp(mensagemComEmojisUnicode);
  console.log('Após processEmojisForWhatsApp:', processadaUnicode);
  
  const encodedUnicode = encodeTextWithEmojisForURL(processadaUnicode);
  console.log('Após encodeTextWithEmojisForURL:', encodedUnicode);
  
  // Teste 3: Comparação de tamanhos
  console.log('\n3. COMPARAÇÃO DE TAMANHOS:');
  console.log('Tamanho original (diretos):', mensagemComEmojisDiretos.length);
  console.log('Tamanho processado (diretos):', processadaDireta.length);
  console.log('Tamanho encoded (diretos):', encodedDireta.length);
  
  console.log('Tamanho original (unicode):', mensagemComEmojisUnicode.length);
  console.log('Tamanho processado (unicode):', processadaUnicode.length);
  console.log('Tamanho encoded (unicode):', encodedUnicode.length);
  
  // Teste 4: Verificação de caracteres especiais
  console.log('\n4. VERIFICAÇÃO DE CARACTERES ESPECIAIS:');
  const caracteresEspeciaisDiretos = mensagemComEmojisDiretos.match(/[^\x00-\x7F]/g);
  const caracteresEspeciaisUnicode = mensagemComEmojisUnicode.match(/[^\x00-\x7F]/g);
  
  console.log('Caracteres não-ASCII (diretos):', caracteresEspeciaisDiretos?.length || 0);
  console.log('Caracteres não-ASCII (unicode):', caracteresEspeciaisUnicode?.length || 0);
  
  return {
    diretos: {
      original: mensagemComEmojisDiretos,
      processada: processadaDireta,
      encoded: encodedDireta
    },
    unicode: {
      original: mensagemComEmojisUnicode,
      processada: processadaUnicode,
      encoded: encodedUnicode
    }
  };
};

/**
 * Testa a conversão de emojis individuais
 */
export const testarEmojisIndividuais = () => {
  console.log('\n🔍 TESTE DE EMOJIS INDIVIDUAIS');
  console.log('==============================');
  
  Object.entries(emojiTests.direct).forEach(([name, emoji]) => {
    const unicode = emojiTests.unicode[name as keyof typeof emojiTests.unicode];
    
    console.log(`\n${name}:`);
    console.log(`  Direto: ${emoji} (${emoji.charCodeAt(0)})`);
    console.log(`  Unicode: ${unicode} (${unicode.charCodeAt(0)})`);
    console.log(`  Processado (direto): ${processEmojisForWhatsApp(emoji)}`);
    console.log(`  Processado (unicode): ${processEmojisForWhatsApp(unicode)}`);
    console.log(`  Encoded (direto): ${encodeTextWithEmojisForURL(emoji)}`);
    console.log(`  Encoded (unicode): ${encodeTextWithEmojisForURL(unicode)}`);
  });
};

/**
 * Função principal para executar todos os testes
 */
export const executarTestesCompletos = () => {
  const resultados = testarEncodingEmojis();
  testarEmojisIndividuais();
  
  console.log('\n✅ TESTES CONCLUÍDOS');
  console.log('====================');
  console.log('Verifique os logs acima para identificar problemas de encoding.');
  
  return resultados;
};