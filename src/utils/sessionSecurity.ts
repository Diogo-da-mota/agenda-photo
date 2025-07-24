import { supabase } from '@/lib/supabase';
import { securityLog } from './securityUtils';

interface SessionConfig {
  warningTimeMinutes: number;
  maxIdleTimeMinutes: number;
  refreshIntervalMinutes: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  warningTimeMinutes: 55, // Avisar 5 minutos antes do timeout
  maxIdleTimeMinutes: 60, // Timeout em 1 hora
  refreshIntervalMinutes: 30 // Refresh a cada 30 minutos
};

/**
 * Gerenciador de segurança de sessão
 */
export class SessionSecurityManager {
  private static instance: SessionSecurityManager;
  private config: SessionConfig;
  private lastActivity: number = Date.now();
  private warningShown: boolean = false;
  private refreshInterval?: NodeJS.Timeout;
  private timeoutWarningCallback?: () => void;
  private sessionExpiredCallback?: () => void;

  private constructor(config: SessionConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.setupActivityListeners();
    this.startRefreshInterval();
  }

  static getInstance(config?: Partial<SessionConfig>): SessionSecurityManager {
    if (!SessionSecurityManager.instance) {
      SessionSecurityManager.instance = new SessionSecurityManager({
        ...DEFAULT_CONFIG,
        ...config
      });
    }
    return SessionSecurityManager.instance;
  }

  /**
   * Configura listeners para atividade do usuário
   */
  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.updateLastActivity.bind(this), true);
    });
  }

  /**
   * Atualiza timestamp da última atividade
   */
  private updateLastActivity(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
  }

  /**
   * Inicia intervalo de verificação e refresh de sessão
   */
  private startRefreshInterval(): void {
    this.refreshInterval = setInterval(() => {
      this.checkSessionStatus();
    }, 60000); // Verifica a cada minuto
  }

  /**
   * Verifica status da sessão e gerencia timeouts
   */
  private async checkSessionStatus(): Promise<void> {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    const minutesIdle = timeSinceLastActivity / (1000 * 60);

    // Verificar se deve mostrar aviso
    if (minutesIdle >= this.config.warningTimeMinutes && !this.warningShown) {
      this.showTimeoutWarning();
      this.warningShown = true;
    }

    // Verificar se deve fazer logout por inatividade
    if (minutesIdle >= this.config.maxIdleTimeMinutes) {
      await this.handleSessionTimeout();
      return;
    }

    // Refresh automático da sessão
    if (minutesIdle < this.config.refreshIntervalMinutes) {
      await this.refreshSession();
    }
  }

  /**
   * Mostra aviso de timeout de sessão
   */
  private showTimeoutWarning(): void {
    // Log removido por segurança - não expor informações sobre timeouts de sessão

    if (this.timeoutWarningCallback) {
      this.timeoutWarningCallback();
    }
  }

  /**
   * Gerencia timeout da sessão
   */
  private async handleSessionTimeout(): Promise<void> {
    // Log removido por segurança - não expor informações sobre atividade do usuário

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout por timeout:', error);
    }

    if (this.sessionExpiredCallback) {
      this.sessionExpiredCallback();
    }
  }

  /**
   * Refresh da sessão se necessário
   */
  private async refreshSession(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        // Log removido por segurança - não expor erros de refresh de sessão
        return;
      }

      if (session) {
        // Verificar se o token está próximo do vencimento
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        const now = Date.now();
        const minutesUntilExpiry = (expiresAt - now) / (1000 * 60);

        // Refresh se restam menos de 10 minutos
        if (minutesUntilExpiry < 10) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            // Log removido por segurança - não expor falhas de refresh
          } else {
            // Log removido por segurança - não expor informações de expiração
          }
        }
      }
    } catch (error) {
      // Log removido por segurança - não expor erros de verificação de sessão
    }
  }

  /**
   * Força refresh da sessão
   */
  async forceRefresh(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        // Log removido por segurança - não expor falhas de refresh forçado
        return false;
      }

      this.updateLastActivity();
      // Log removido por segurança - não expor sucesso de refresh
      return true;
    } catch (error) {
      // Log removido por segurança - não expor erros de refresh forçado
      return false;
    }
  }

  /**
   * Estende a sessão (reseta timer de inatividade)
   */
  extendSession(): void {
    this.updateLastActivity();
    // Log removido por segurança - não expor extensões de sessão
  }

  /**
   * Configura callbacks para eventos de sessão
   */
  setCallbacks(callbacks: {
    onTimeoutWarning?: () => void;
    onSessionExpired?: () => void;
  }): void {
    this.timeoutWarningCallback = callbacks.onTimeoutWarning;
    this.sessionExpiredCallback = callbacks.onSessionExpired;
  }

  /**
   * Obtém informações sobre o status da sessão
   */
  getSessionInfo(): {
    minutesIdle: number;
    minutesUntilWarning: number;
    minutesUntilTimeout: number;
  } {
    const now = Date.now();
    const minutesIdle = (now - this.lastActivity) / (1000 * 60);
    
    return {
      minutesIdle,
      minutesUntilWarning: Math.max(0, this.config.warningTimeMinutes - minutesIdle),
      minutesUntilTimeout: Math.max(0, this.config.maxIdleTimeMinutes - minutesIdle)
    };
  }

  /**
   * Limpa recursos
   */
  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.updateLastActivity.bind(this), true);
    });
  }
}

// Hook para usar o gerenciador de sessão
export const useSessionSecurity = (config?: Partial<SessionConfig>) => {
  const manager = SessionSecurityManager.getInstance(config);
  
  return {
    forceRefresh: () => manager.forceRefresh(),
    extendSession: () => manager.extendSession(),
    getSessionInfo: () => manager.getSessionInfo(),
    setCallbacks: (callbacks: { onTimeoutWarning?: () => void; onSessionExpired?: () => void }) => 
      manager.setCallbacks(callbacks)
  };
};