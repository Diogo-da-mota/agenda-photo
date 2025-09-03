/**
 * Utilitário para armazenamento híbrido (localStorage + cookies)
 * Resolve problemas específicos do Safari/macOS com localStorage
 */

// Tipos para melhor tipagem
interface StorageTestResult {
  isAvailable: boolean;
  error?: string;
  isSafari: boolean;
  isPrivateMode: boolean;
}

interface StorageOptions {
  expires?: number; // dias para expiração do cookie
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Detecta se o navegador é Safari
 */
export const isSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);
};

/**
 * Detecta se está em modo privado (aproximação)
 */
export const isPrivateMode = (): boolean => {
  try {
    // Teste específico para Safari
    if (isSafari()) {
      const test = '__private_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return false;
    }
    return false;
  } catch {
    return true;
  }
};

/**
 * Detectar se localStorage está disponível e funcional
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    const retrieved = localStorage.getItem(test);
    localStorage.removeItem(test);
    
    // Verificar se o valor foi realmente armazenado e recuperado
    if (retrieved !== test) {
      console.warn('[StorageUtils] localStorage não está funcionando corretamente');
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('[StorageUtils] localStorage não disponível:', error);
    return false;
  }
};

/**
 * Testa a capacidade do localStorage
 */
export const testLocalStorageCapability = async (): Promise<StorageTestResult> => {
  const result: StorageTestResult = {
    isAvailable: false,
    isSafari: isSafari(),
    isPrivateMode: isPrivateMode()
  };

  try {
    const testKey = '__storage_capability_test__';
    const testValue = 'test_value_' + Date.now();
    
    // Tenta escrever
    localStorage.setItem(testKey, testValue);
    
    // Tenta ler
    const retrievedValue = localStorage.getItem(testKey);
    
    // Tenta remover
    localStorage.removeItem(testKey);
    
    // Verifica se funcionou corretamente
    if (retrievedValue === testValue) {
      result.isAvailable = true;
    } else {
      result.error = 'localStorage não retornou o valor correto';
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Erro desconhecido';
  }

  return result;
};

/**
 * Utilitários para cookies
 */
export const cookieUtils = {
  set: (name: string, value: string, options: StorageOptions = {}): void => {
    const {
      expires = 30, // 30 dias por padrão
      secure = window.location.protocol === 'https:',
      sameSite = 'Strict'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (expires) {
      const date = new Date();
      date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    
    cookieString += `; path=/`;
    cookieString += `; SameSite=${sameSite}`;
    
    if (secure) {
      cookieString += `; Secure`;
    }
    
    document.cookie = cookieString;
  },

  get: (name: string): string | null => {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    
    return null;
  },

  remove: (name: string): void => {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};

/**
 * Classe principal para armazenamento híbrido
 */
export class HybridStorage {
  private useLocalStorage: boolean = true;
  private storageTest: StorageTestResult | null = null;
  private debugMode: boolean = false;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    this.storageTest = await testLocalStorageCapability();
    this.useLocalStorage = this.storageTest.isAvailable;
    
    if (this.debugMode) {
      console.log('🔍 HybridStorage - Resultado do teste:', {
        localStorage: this.storageTest.isAvailable,
        isSafari: this.storageTest.isSafari,
        isPrivateMode: this.storageTest.isPrivateMode,
        error: this.storageTest.error,
        strategy: this.useLocalStorage ? 'localStorage' : 'cookies'
      });
    }
  }

  /**
   * Define um valor no armazenamento
   */
  public setItem(key: string, value: string, options?: StorageOptions): void {
    try {
      if (this.useLocalStorage) {
        localStorage.setItem(key, value);
        if (this.debugMode) {
          console.log(`✅ HybridStorage - localStorage.setItem('${key}')`);
        }
      } else {
        cookieUtils.set(key, value, options);
        if (this.debugMode) {
          console.log(`🍪 HybridStorage - cookie.set('${key}')`);
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.warn(`⚠️ HybridStorage - Erro ao salvar '${key}':`, error);
      }
      
      // Fallback para cookies se localStorage falhar
      if (this.useLocalStorage) {
        this.useLocalStorage = false;
        cookieUtils.set(key, value, options);
        if (this.debugMode) {
          console.log(`🔄 HybridStorage - Fallback para cookies: '${key}'`);
        }
      }
    }
  }

  /**
   * Recupera um valor do armazenamento
   */
  public getItem(key: string): string | null {
    try {
      let value: string | null = null;
      
      if (this.useLocalStorage) {
        value = localStorage.getItem(key);
        if (this.debugMode) {
          console.log(`📖 HybridStorage - localStorage.getItem('${key}'):`, value);
        }
      } else {
        value = cookieUtils.get(key);
        if (this.debugMode) {
          console.log(`🍪 HybridStorage - cookie.get('${key}'):`, value);
        }
      }
      
      // Se não encontrou no método principal, tenta o outro
      if (value === null) {
        if (this.useLocalStorage) {
          value = cookieUtils.get(key);
          if (this.debugMode && value !== null) {
            console.log(`🔄 HybridStorage - Encontrado em cookies: '${key}':`, value);
          }
        } else {
          try {
            value = localStorage.getItem(key);
            if (this.debugMode && value !== null) {
              console.log(`🔄 HybridStorage - Encontrado em localStorage: '${key}':`, value);
            }
          } catch {
            // Ignora erro do localStorage
          }
        }
      }
      
      return value;
    } catch (error) {
      if (this.debugMode) {
        console.warn(`⚠️ HybridStorage - Erro ao recuperar '${key}':`, error);
      }
      return null;
    }
  }

  /**
   * Remove um valor do armazenamento
   */
  public removeItem(key: string): void {
    try {
      if (this.useLocalStorage) {
        localStorage.removeItem(key);
        if (this.debugMode) {
          console.log(`🗑️ HybridStorage - localStorage.removeItem('${key}')`);
        }
      } else {
        cookieUtils.remove(key);
        if (this.debugMode) {
          console.log(`🗑️ HybridStorage - cookie.remove('${key}')`);
        }
      }
      
      // Remove de ambos os locais para garantir
      try {
        localStorage.removeItem(key);
        cookieUtils.remove(key);
      } catch {
        // Ignora erros
      }
    } catch (error) {
      if (this.debugMode) {
        console.warn(`⚠️ HybridStorage - Erro ao remover '${key}':`, error);
      }
    }
  }

  /**
   * Limpa todo o armazenamento
   */
  public clear(): void {
    try {
      if (this.useLocalStorage) {
        localStorage.clear();
      }
      
      // Remove cookies relacionados ao app
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        cookieUtils.remove(name);
      }
      
      if (this.debugMode) {
        console.log('🧹 HybridStorage - Armazenamento limpo');
      }
    } catch (error) {
      if (this.debugMode) {
        console.warn('⚠️ HybridStorage - Erro ao limpar:', error);
      }
    }
  }

  /**
   * Retorna informações sobre o estado do armazenamento
   */
  public getStorageInfo(): StorageTestResult & { strategy: string } {
    return {
      ...this.storageTest!,
      strategy: this.useLocalStorage ? 'localStorage' : 'cookies'
    };
  }
}

// Instância global para uso em toda a aplicação
export const hybridStorage = new HybridStorage(process.env.NODE_ENV === 'development');

// Funções de conveniência que mantêm a API familiar
export const setStorageItem = (key: string, value: string, options?: StorageOptions): void => {
  hybridStorage.setItem(key, value, options);
};

export const getStorageItem = (key: string): string | null => {
  return hybridStorage.getItem(key);
};

export const removeStorageItem = (key: string): void => {
  hybridStorage.removeItem(key);
};

export const clearStorage = (): void => {
  hybridStorage.clear();
};

export const getStorageInfo = () => {
  return hybridStorage.getStorageInfo();
};