import CryptoJS from 'crypto-js';

// Chave para criptografia (em produção, isso deveria vir de uma variável de ambiente)
const ENCRYPTION_KEY = 'agenda-pro-remember-me-key';
const STORAGE_KEY = 'agenda_pro_remember_me';

interface RememberMeData {
  email: string;
  password: string;
  timestamp: number;
}

/**
 * Criptografa os dados antes de salvar
 */
function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

/**
 * Descriptografa os dados salvos
 */
function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Salva as credenciais do usuário no localStorage
 */
export function saveCredentials(email: string, password: string): void {
  try {
    console.log('[REMEMBER_ME] Iniciando salvamento de credenciais para:', email);
    
    const data: RememberMeData = {
      email,
      password,
      timestamp: Date.now()
    };
    
    console.log('[REMEMBER_ME] Dados preparados, criptografando...');
    const encryptedData = encryptData(JSON.stringify(data));
    
    console.log('[REMEMBER_ME] Dados criptografados, salvando no localStorage...');
    localStorage.setItem(STORAGE_KEY, encryptedData);
    
    // Verificar se foi salvo corretamente
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      console.log('[REMEMBER_ME] Credenciais salvas com sucesso no localStorage');
    } else {
      console.error('[REMEMBER_ME] Falha ao salvar no localStorage');
    }
  } catch (error) {
    console.error('[REMEMBER_ME] Erro ao salvar credenciais:', error);
  }
}

/**
 * Carrega as credenciais salvas do localStorage
 */
export function loadCredentials(): RememberMeData | null {
  try {
    console.log('[REMEMBER_ME] Tentando carregar credenciais do localStorage...');
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    
    if (!encryptedData) {
      console.log('[REMEMBER_ME] Nenhum dado encontrado no localStorage');
      return null;
    }
    
    console.log('[REMEMBER_ME] Dados encontrados, descriptografando...');
    const decryptedData = decryptData(encryptedData);
    const data: RememberMeData = JSON.parse(decryptedData);
    
    console.log('[REMEMBER_ME] Dados descriptografados, verificando validade...');
    // Verificar se os dados não são muito antigos (30 dias)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const age = Date.now() - data.timestamp;
    console.log('[REMEMBER_ME] Idade dos dados:', Math.floor(age / (24 * 60 * 60 * 1000)), 'dias');
    
    if (age > thirtyDaysInMs) {
      console.log('[REMEMBER_ME] Dados expirados (mais de 30 dias), limpando...');
      clearCredentials();
      return null;
    }
    
    console.log('[REMEMBER_ME] Credenciais carregadas com sucesso para:', data.email);
    return data;
  } catch (error) {
    console.error('[REMEMBER_ME] Erro ao carregar credenciais:', error);
    clearCredentials(); // Limpar dados corrompidos
    return null;
  }
}

/**
 * Remove as credenciais salvas do localStorage
 */
export function clearCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[REMEMBER_ME] Credenciais removidas com sucesso');
  } catch (error) {
    console.error('[REMEMBER_ME] Erro ao remover credenciais:', error);
  }
}

/**
 * Verifica se existem credenciais salvas
 */
export function hasStoredCredentials(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Atualiza o timestamp das credenciais salvas (para renovar o prazo de 30 dias)
 */
export function refreshCredentials(): void {
  const credentials = loadCredentials();
  if (credentials) {
    saveCredentials(credentials.email, credentials.password);
  }
}