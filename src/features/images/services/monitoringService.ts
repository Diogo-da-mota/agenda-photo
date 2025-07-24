
interface ImageStats {
  total: number;
  totalImages: number; // Changed from totalUploads to totalImages
  totalSize: number;
  averageSize: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  recentUploads: Array<{
    date: string;
    count: number;
  }>;
}

export const monitoringService = {
  async getImageStats(userId: string): Promise<ImageStats> {
    try {
      console.log('Obtendo estatísticas de imagens para usuário:', userId);
      
      return {
        total: 0,
        totalImages: 0, // Changed from totalUploads
        totalSize: 0,
        averageSize: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        recentUploads: []
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de imagens:', error);
      return {
        total: 0,
        totalImages: 0, // Changed from totalUploads
        totalSize: 0,
        averageSize: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        recentUploads: []
      };
    }
  },

  async logImageUpload(imageData: any): Promise<void> {
    try {
      console.log('Registrando upload de imagem:', imageData);
    } catch (error) {
      console.error('Erro ao registrar upload de imagem:', error);
    }
  }
};

// Função auxiliar para compatibilidade
export const getUploadStats = async (userId: string) => {
  return await monitoringService.getImageStats(userId);
};
