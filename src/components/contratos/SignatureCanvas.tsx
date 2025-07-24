
import React, { useRef, useState, useEffect } from 'react';

interface SignatureCanvasProps {
  onSign: (signatureData: string | null) => void;
  signature: string | null;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSign, signature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detectar se é dispositivo móvel
    const detectMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    
    detectMobile();
    window.addEventListener('resize', detectMobile);
    
    return () => {
      window.removeEventListener('resize', detectMobile);
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match its display size
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 150; // Fixed height
        
        // Set up the context after resize
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // If there's a saved signature, restore it
    if (signature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = signature;
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [signature]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get the position
    let posX, posY;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      posX = e.touches[0].clientX - rect.left;
      posY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      posX = e.nativeEvent.offsetX;
      posY = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(posX, posY);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get the position
    let posX, posY;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      posX = e.touches[0].clientX - rect.left;
      posY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      posX = e.nativeEvent.offsetX;
      posY = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(posX, posY);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    // Save the signature as a data URL
    const signatureData = canvas.toDataURL('image/png');
    onSign(signatureData);
  };
  
  const handleCancelDrawing = () => {
    setIsDrawing(false);
  };
  
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSign(null);
  };
  
  return (
    <div className="signature-canvas-container">
      <div className="mb-2 text-sm text-muted-foreground flex items-center justify-between">
        <p>{isMobile ? "Use seu dedo para assinar" : "Use o mouse para assinar"}</p>
        <button 
          type="button" 
          onClick={handleClearCanvas}
          className="text-xs text-destructive underline"
        >
          Limpar
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full cursor-crosshair touch-none border rounded-md bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={handleCancelDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
};
