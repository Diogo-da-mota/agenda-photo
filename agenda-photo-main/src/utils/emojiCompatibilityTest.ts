import { processEmojisForWhatsApp, encodeTextWithEmojisForURL, hasValidEmojis, convertShortcodesToEmoji } from './emojiUtils';

/**
 * Testa a compatibilidade dos emojis utilizados no TesteMensagem.tsx
 */
export const testEmojiCompatibility = () => {
  console.log('🧪 Iniciando teste de compatibilidade de emojis...\n');

  // Emojis utilizados no TesteMensagem.tsx (linhas 21-25)
  const emojisUsados = [
    '✅', // Check mark
    '📋', // Clipboard
    '💰', // Money bag
    '📅', // Calendar
    '🧾'  // Receipt
  ];

  const resultados = {
    emojisTestados: emojisUsados.length,
    emojisValidos: 0,
    emojisProcessados: 0,
    emojisCodeificados: 0,
    detalhes: [] as Array<{
      emoji: string;
      valido: boolean;
      processado: string;
      codificado: string;
      unicode: string;
    }>
  };

  console.log('📊 Testando emojis individuais:');
  console.log('================================');

  emojisUsados.forEach((emoji, index) => {
    const valido = hasValidEmojis(emoji);
    const processado = processEmojisForWhatsApp(emoji);
    const codificado = encodeTextWithEmojisForURL(emoji);
    const unicode = emoji.codePointAt(0)?.toString(16).toUpperCase() || 'N/A';

    if (valido) resultados.emojisValidos++;
    if (processado === emoji || processado.length > 0) resultados.emojisProcessados++;
    if (codificado.length > 0) resultados.emojisCodeificados++;

    resultados.detalhes.push({
      emoji,
      valido,
      processado,
      codificado,
      unicode: `U+${unicode}`
    });

    console.log(`${index + 1}. Emoji: ${emoji}`);
    console.log(`   Válido: ${valido ? '✅' : '❌'}`);
    console.log(`   Processado: ${processado}`);
    console.log(`   Codificado: ${codificado}`);
    console.log(`   Unicode: U+${unicode}`);
    console.log('');
  });

  // Teste com mensagem completa do TesteMensagem.tsx
  const mensagemCompleta = `Confirmamos o recebimento do seu pagamento! ✅

📋 Detalhes do pagamento:
💰 Valor: R$ {valor_entrada}
📅 Data: {data_atual}
📋 Referente: {titulo_evento}
🧾 Comprovante: {data_atual}`;

  console.log('📝 Testando mensagem completa:');
  console.log('==============================');
  console.log('Mensagem original:');
  console.log(mensagemCompleta);
  console.log('');

  const mensagemProcessada = processEmojisForWhatsApp(mensagemCompleta);
  const mensagemCodificada = encodeTextWithEmojisForURL(mensagemCompleta);

  console.log('Mensagem processada:');
  console.log(mensagemProcessada);
  console.log('');

  console.log('Mensagem codificada para URL:');
  console.log(mensagemCodificada);
  console.log('');

  // Teste de shortcodes (caso sejam usados)
  const shortcodes = [':white_check_mark:', ':clipboard:', ':moneybag:', ':calendar:', ':receipt:'];
  console.log('🔄 Testando conversão de shortcodes:');
  console.log('====================================');
  
  shortcodes.forEach((shortcode, index) => {
    const convertido = convertShortcodesToEmoji(shortcode);
    console.log(`${index + 1}. ${shortcode} → ${convertido}`);
  });

  console.log('\n📈 Resumo dos resultados:');
  console.log('=========================');
  console.log(`Total de emojis testados: ${resultados.emojisTestados}`);
  console.log(`Emojis válidos: ${resultados.emojisValidos}/${resultados.emojisTestados}`);
  console.log(`Emojis processados: ${resultados.emojisProcessados}/${resultados.emojisTestados}`);
  console.log(`Emojis codificados: ${resultados.emojisCodeificados}/${resultados.emojisTestados}`);
  
  const compatibilidade = (resultados.emojisValidos / resultados.emojisTestados) * 100;
  console.log(`Taxa de compatibilidade: ${compatibilidade.toFixed(1)}%`);

  if (compatibilidade === 100) {
    console.log('🎉 Todos os emojis são compatíveis com WhatsApp!');
  } else if (compatibilidade >= 80) {
    console.log('⚠️ A maioria dos emojis é compatível, mas alguns podem ter problemas.');
  } else {
    console.log('❌ Muitos emojis podem ter problemas de compatibilidade.');
  }

  return resultados;
};

/**
 * Executa o teste e retorna os resultados
 */
export const runEmojiCompatibilityTest = () => {
  try {
    return testEmojiCompatibility();
  } catch (error) {
    console.error('❌ Erro ao executar teste de compatibilidade:', error);
    return null;
  }
};