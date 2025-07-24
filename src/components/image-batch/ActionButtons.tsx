
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileImage, Loader2, XCircle, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onSelectClick: () => void;
  onProcessClick: () => void;
  onCancelClick: () => void;
  onClearClick: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSelectClick,
  onProcessClick,
  onCancelClick,
  onClearClick,
  isProcessing,
  hasFiles,
  fileInputRef
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={onSelectClick}
        disabled={isProcessing}
        className="gap-1"
      >
        <Upload className="h-4 w-4" />
        Selecionar Imagens
      </Button>
      
      <Button
        variant="outline"
        onClick={onProcessClick}
        disabled={!hasFiles || isProcessing}
        className="gap-1"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <FileImage className="h-4 w-4" />
            Processar Fila
          </>
        )}
      </Button>
      
      {isProcessing && (
        <Button
          variant="destructive"
          onClick={onCancelClick}
          className="gap-1"
        >
          <XCircle className="h-4 w-4" />
          Cancelar
        </Button>
      )}
      
      {hasFiles && !isProcessing && (
        <Button
          variant="destructive"
          onClick={onClearClick}
          className="gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Limpar Fila
        </Button>
      )}
      
      <input 
        type="file" 
        className="hidden"
        ref={fileInputRef}
        onChange={() => {}}
        accept="image/*"
        multiple
        disabled={isProcessing}
      />
    </div>
  );
};

export default ActionButtons;
