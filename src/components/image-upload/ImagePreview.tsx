
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  previewUrl: string;
  onClear: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ previewUrl, onClear }) => {
  return (
    <div className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700">
      <Button 
        variant="destructive" 
        size="icon" 
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onClear}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="flex justify-center">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="max-h-40 object-contain"
        />
      </div>
    </div>
  );
};

export default ImagePreview;
