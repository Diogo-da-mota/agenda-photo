
import React from 'react';
import { ImageIcon, Activity, HardDrive, Clock } from 'lucide-react';
import ImageUpload from "@/components/ImageUpload";

interface UploadSectionProps {
  onUploadComplete: (url: string) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUploadComplete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Upload com Monitoramento</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Faça upload de imagens e monitore o progresso e métricas em tempo real.
        </p>
        
        <ImageUpload
          showPreview={true}
          maxSize={5}
          buttonText="Selecionar imagem para analisar"
          onUploadComplete={onUploadComplete}
        />
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Dicas para Uploads Eficientes</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <ImageIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Use formatos adequados</p>
              <p className="text-gray-500 dark:text-gray-400">
                WebP e JPEG são mais eficientes para fotografias, PNG para gráficos com transparência.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Activity className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Monitoramento em tempo real</p>
              <p className="text-gray-500 dark:text-gray-400">
                Acompanhe as estatísticas para identificar gargalos e melhorar a performance.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <HardDrive className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Armazenamento otimizado</p>
              <p className="text-gray-500 dark:text-gray-400">
                A compressão automática economiza em média 48% de armazenamento sem perda perceptível de qualidade.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Tempos de upload</p>
              <p className="text-gray-500 dark:text-gray-400">
                Imagens menores que 2MB normalmente são processadas em menos de 1 segundo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
