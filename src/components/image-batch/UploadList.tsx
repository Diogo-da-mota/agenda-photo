
import React from 'react';
import UploadItem from './UploadItem';
import { ImageItem } from './types';
import { FileImage } from 'lucide-react';

interface UploadListProps {
  files: ImageItem[];
  onRemoveItem: (id: string) => void;
  isProcessing: boolean;
  formatFileSize: (bytes: number) => string;
}

const UploadList: React.FC<UploadListProps> = ({ 
  files, 
  onRemoveItem, 
  isProcessing,
  formatFileSize 
}) => {
  if (files.length === 0) {
    return (
      <div className="border border-dashed rounded-md p-8 text-center">
        <FileImage className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400">
          Selecione imagens para adicionar à fila de upload
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Você pode selecionar várias imagens para processar em lote
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 py-2 px-3 text-sm font-medium border-b">
        Fila de Upload ({files.length} {files.length === 1 ? 'imagem' : 'imagens'})
      </div>
      
      <div className="divide-y">
        {files.map(item => (
          <UploadItem 
            key={item.id} 
            item={item} 
            onRemove={onRemoveItem} 
            isProcessing={isProcessing}
            formatFileSize={formatFileSize}
          />
        ))}
      </div>
    </div>
  );
};

export default UploadList;
