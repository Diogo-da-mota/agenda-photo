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
    const data: RememberMeData = {
      email,
      password,
      timestamp: Date.now()
    };
    
    const encryptedData = encryptData(JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY, encryptedData);
    
    console.log('[REMEMBER_ME] Credenciais salvas com sucesso');
  } catch (error) {
    console.error('[REMEMBER_ME] Erro ao salvar credenciais:', error);
  }
}

/**
 * Carrega as credenciais salvas do localStorage
 */
export function loadCredentials(): RememberMeData | null {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    
    if (!encryptedData) {
      return null;
    }
    
    const decryptedData = decryptData(encryptedData);
    const data: RememberMeData = JSON.parse(decryptedData);
    
    // Verificar se os dados não são muito antigos (30 dias)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > thirtyDaysInMs) {
      clearCredentials();
      return null;
    }
    
    console.log('[REMEMBER_ME] Credenciais carregadas com sucesso');
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