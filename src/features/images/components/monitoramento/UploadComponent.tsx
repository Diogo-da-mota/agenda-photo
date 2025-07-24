
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadComponentProps {
  onFileUpload: (file: File) => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
  uploadSuccess: boolean;
  uploadError: string | null;
  fileSizeLimit: number;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  onFileUpload,
  uploading,
  uploadProgress,
  uploadSuccess,
  uploadError,
  fileSizeLimit
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };
  
  // Trigger file input click
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept="image/*"
          disabled={uploading}
        />
        
        {uploadSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Upload concluído</h3>
          </div>
        ) : uploadError ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold">Erro no upload</h3>
            <p className="text-sm text-red-500">{uploadError}</p>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-gray-200 animate-spin"></div>
            <h3 className="text-lg font-semibold">Enviando...</h3>
            <div className="w-full max-w-xs">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-center mt-2">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-semibold">Solte sua imagem aqui ou clique para navegar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Suporta: JPG, PNG, GIF, WEBP (max {(fileSizeLimit / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadComponent;
