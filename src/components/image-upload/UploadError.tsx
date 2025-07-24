
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UploadErrorProps {
  error: string;
}

const UploadError: React.FC<UploadErrorProps> = ({ error }) => {
  // Extract specific error messages to provide more user-friendly responses
  let displayError = error;
  
  if (error.includes('excedeu o tempo limite')) {
    displayError = 'O upload demorou muito tempo. Por favor, tente novamente com uma imagem menor ou verifique sua conexão.';
  } else if (error.includes('muito grande')) {
    displayError = error; // Keep the specific size error message
  } else if (error.includes('falhou') && error.includes('503')) {
    displayError = 'O serviço de upload está temporariamente indisponível. Por favor, tente novamente mais tarde.';
  } else if (error.includes('falhou') && error.includes('429')) {
    displayError = 'Muitas solicitações de upload. Por favor, aguarde um momento e tente novamente.';
  }
  
  return (
    <Card className="p-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
      <div className="flex items-start text-sm text-red-600 dark:text-red-400">
        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <span className="flex-1">{displayError}</span>
      </div>
    </Card>
  );
};

export default UploadError;
