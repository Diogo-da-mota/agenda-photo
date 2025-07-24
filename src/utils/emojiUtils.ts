import EmojiConvertor from 'emoji-js';

// Configurar o conversor de emoji para WhatsApp
const emoji = new EmojiConvertor();

// Configurações para compatibilidade com WhatsApp
emoji.replace_mode = 'unified';
emoji.allow_native = true;
emoji.use_css_imgs = false;
emoji.img_sets.apple.path = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/';
emoji.img_sets.apple.sheet = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png';

/**
 * Processa uma string de texto para garantir que os emojis sejam compatíveis com WhatsApp
 * @param text - Texto que pode conter emojis
 * @returns Texto com emojis processados para compatibilidade com WhatsApp
 */
export const processEmojisForWhatsApp = (text: string): string => {
  if (!text) return text;
  
  try {
    // Converter emojis para formato unified (Unicode) que é compatível com WhatsApp
    let processedText = emoji.replace_colons(text);
    
    // Garantir que emojis nativos sejam preservados
    processedText = emoji.replace_unified(processedText);
    
    // Normalizar caracteres Unicode para evitar problemas de codificação
    processedText = processedText.normalize('NFC');
    
    return processedText;
  } catch (error) {
    console.warn('Erro ao processar emojis:', error);
    // Em caso de erro, retornar o texto original
    return text;
  }
};

/**
 * Converte emojis de shortcode (:smile:) para Unicode
 * @param text - Texto com shortcodes de emoji
 * @returns Texto com emojis Unicode
 */
export const convertShortcodesToEmoji = (text: string): string => {
  if (!text) return text;
  
  try {
    return emoji.replace_colons(text);
  } catch (error) {
    console.warn('Erro ao converter shortcodes:', error);
    return text;
  }
};

/**
 * Remove emojis de um texto (útil para fallback)
 * @param text - Texto que pode conter emojis
 * @returns Texto sem emojis
 */
export const removeEmojis = (text: string): string => {
  if (!text) return text;
  
  try {
    // Regex atualizado para incluir emojis mais recentes (Unicode 11.0+)
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]/gu;
    return text.replace(emojiRegex, '');
  } catch (error) {
    console.warn('Erro ao remover emojis:', error);
    return text;
  }
};

/**
 * Valida se um texto contém emojis válidos
 * @param text - Texto para validar
 * @returns true se contém emojis válidos, false caso contrário
 */
export const hasValidEmojis = (text: string): boolean => {
  if (!text) return false;
  
  try {
    // Regex atualizado para incluir emojis mais recentes (Unicode 11.0+)
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]/gu;
    return emojiRegex.test(text);
  } catch (error) {
    console.warn('Erro ao validar emojis:', error);
    return false;
  }
};

/**
 * Codifica texto com emojis para URL de forma segura
 * @param text - Texto com emojis para codificar
 * @returns Texto codificado para URL
 */
export const encodeTextWithEmojisForURL = (text: string): string => {
  if (!text) return text;
  
  try {
    // Primeiro processar emojis para garantir compatibilidade
    const processedText = processEmojisForWhatsApp(text);
    
    // Codificar para URL usando encodeURIComponent que preserva emojis Unicode
    return encodeURIComponent(processedText);
  } catch (error) {
    console.warn('Erro ao codificar texto com emojis:', error);
    // Fallback: tentar codificar o texto original
    return encodeURIComponent(text);
  }
};