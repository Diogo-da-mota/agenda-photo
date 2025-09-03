
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  isLoading: boolean;
  uploadProgress: {
    current: number;
    total: number;
    currentFileName: string;
  } | null;
  onCancel?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isLoading,
  uploadProgress,
  onCancel
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
          Cancelar
        </Button>
      )}
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-w-[120px]">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {uploadProgress ? 
              `Enviando ${uploadProgress.current}/${uploadProgress.total}...` :
              'Publicando...'
            }
          </>
        ) : (
          'Publicar'
        )}
      </Button>
    </div>
  );
};

export default ActionButtons;
