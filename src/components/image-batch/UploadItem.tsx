
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { ImageItem } from './types';

interface UploadItemProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  isProcessing: boolean;
  formatFileSize: (bytes: number) => string;
}

const UploadItem: React.FC<UploadItemProps> = ({ 
  item, 
  onRemove, 
  isProcessing,
  formatFileSize 
}) => {
  return (
    <div 
      key={item.id} 
      className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img 
            src={item.previewUrl} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{item.file.name}</p>
          <p className="text-xs text-gray-500">
            {formatFileSize(item.file.size)} • {item.file.type.replace('image/', '')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Status do item */}
        {item.status === 'waiting' && (
          <span className="text-xs text-gray-500 dark:text-gray-400">Aguardando</span>
        )}
        
        {item.status === 'processing' && (
          <div className="flex items-center">
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin mr-1" />
            <span className="text-xs text-blue-500">Processando</span>
          </div>
        )}
        
        {item.status === 'success' && (
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-500">Concluído</span>
          </div>
        )}
        
        {item.status === 'error' && (
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs text-red-500" title={item.error}>Falha</span>
          </div>
        )}
        
        {/* Botão de remover */}
        {!isProcessing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UploadItem;
