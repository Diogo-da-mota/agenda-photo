
/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate mock upload times data
 */
export function getMockUploadTimes() {
  return [
    { name: '01/06', tempo: 1200 },
    { name: '02/06', tempo: 980 },
    { name: '03/06', tempo: 1400 },
    { name: '04/06', tempo: 850 },
    { name: '05/06', tempo: 1100 },
    { name: '06/06', tempo: 1300 },
    { name: '07/06', tempo: 920 }
  ];
}

/**
 * Generate mock upload metrics
 */
export function getMockRecentUploads() {
  return [
    {
      fileName: 'foto1.jpg',
      fileType: 'image/jpeg',
      originalSize: 2500000,
      compressedSize: 1200000,
      compressionRatio: 52,
      uploadDuration: 1250,
      success: true,
      date: '2023-06-10 14:30'
    },
    {
      fileName: 'banner.png',
      fileType: 'image/png',
      originalSize: 4200000,
      compressedSize: 1800000,
      compressionRatio: 57,
      uploadDuration: 2100,
      success: true,
      date: '2023-06-09 10:15'
    },
    {
      fileName: 'icon.webp',
      fileType: 'image/webp',
      originalSize: 350000,
      compressedSize: 280000,
      compressionRatio: 20,
      uploadDuration: 800,
      success: true,
      date: '2023-06-09 09:45'
    },
    {
      fileName: 'large-file.jpg',
      fileType: 'image/jpeg',
      originalSize: 8500000,
      compressedSize: 0,
      compressionRatio: 0,
      uploadDuration: 0,
      success: false,
      date: '2023-06-08 16:20'
    }
  ];
}

/**
 * Generate default stats
 */
export function getDefaultStats() {
  return {
    totalUploads: 147,
    successfulUploads: 143,
    failedUploads: 4,
    averageUploadTime: 1.2, // segundos
    totalStorageUsed: '45.8 MB',
    compressionRate: 48, // porcentagem média
    byFileType: {
      'image/jpeg': 70,
      'image/png': 42,
      'image/webp': 25,
      'image/gif': 10
    }
  };
}

// Constantes padrão para cores do flyer
export const DEFAULT_FLYER_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  text: '#ffffff',
  background: '#111827'
};
