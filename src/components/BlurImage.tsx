
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const BlurImage: React.FC<BlurImageProps> = ({ 
  src, 
  alt, 
  className,
  width,
  height
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden">
      <div
        className={cn(
          "transition-all duration-500 ease-in-out",
          isLoaded ? "opacity-0 scale-110" : "opacity-100 scale-100",
          "absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
        )}
      />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-all duration-500 ease-in-out",
          isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
          className
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default BlurImage;
