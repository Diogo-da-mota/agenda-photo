
import React from 'react';

interface ProgressSectionProps {
  uploadProgress: {
    current: number;
    total: number;
    currentFileName: string;
  } | null;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ uploadProgress }) => {
  if (!uploadProgress) return null;

  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Enviando imagens </span>
        <span>{uploadProgress.current}/{uploadProgress.total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {uploadProgress.currentFileName}
      </p>
    </div>
  );
};

export default ProgressSection;
