/**
 * Utilitário para detecção de dispositivos e compatibilidade
 * Solução específica para problema de download em iOS
 */

export const deviceDetection = {
  /**
   * Detecta se o dispositivo é iOS (iPhone, iPad, iPod)
   */
  isIOS: (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  /**
   * Detecta se o navegador é Safari
   */
  isSafari: (): boolean => {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  },

  /**
   * Detecta se é Safari no iOS
   */
  isIOSSafari: (): boolean => {
    return deviceDetection.isIOS() && deviceDetection.isSafari();
  },

  /**
   * Detecta se o dispositivo suporta o atributo download nativamente
   */
  supportsDownloadAttribute: (): boolean => {
    const link = document.createElement('a');
    return typeof link.download !== 'undefined' && !deviceDetection.isIOS();
  },

  /**
   * Detecta se o dispositivo suporta a Share API
   */
  supportsShareAPI: (): boolean => {
    return 'share' in navigator && 'canShare' in navigator;
  },

  /**
   * Retorna informações completas do dispositivo
   */
  getDeviceInfo: () => {
    return {
      isIOS: deviceDetection.isIOS(),
      isSafari: deviceDetection.isSafari(),
      isIOSSafari: deviceDetection.isIOSSafari(),
      supportsDownload: deviceDetection.supportsDownloadAttribute(),
      supportsShare: deviceDetection.supportsShareAPI(),
      userAgent: navigator.userAgent
    };
  }
};