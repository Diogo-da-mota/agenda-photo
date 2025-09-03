
interface ImageData {
  id: string;
  url: string;
  user_id: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
  created_at: string;
}

export const storageService = {
  async saveImageRecord(imageData: Partial<ImageData>): Promise<ImageData | null> {
    try {
      // Mock save - retorna dados simulados
      console.log('Salvando registro de imagem:', imageData);
      
      const mockImage: ImageData = {
        id: `mock-${Date.now()}`,
        url: imageData.url || '',
        user_id: imageData.user_id || '',
        filename: imageData.filename || 'mock-file.jpg',
        filesize: imageData.filesize || 0,
        mimetype: imageData.mimetype || 'image/jpeg',
        created_at: new Date().toISOString()
      };
      
      return mockImage;
    } catch (error) {
      console.error('Erro ao salvar registro de imagem:', error);
      return null;
    }
  },

  async deleteImageRecord(imageId: string): Promise<boolean> {
    try {
      // Mock delete
      console.log('Deletando registro de imagem:', imageId);
      return true;
    } catch (error) {
      console.error('Erro ao deletar registro de imagem:', error);
      return false;
    }
  }
};
