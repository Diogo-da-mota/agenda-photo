import React from 'react';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Componente de Logo específico para a Landing Page
 * Este componente é completamente independente do Logo principal
 * e garante que a palavra "PRO" esteja sempre na cor roxa correta
 */
const LandingLogo: React.FC = () => {
  // Cor roxa exata conforme requisito (#a142f4)
  const purpleColor = "#a142f4";
  
  return (
    <Link 
      to="/" 
      className="flex items-center gap-2 font-medium transition-all duration-300 hover:opacity-80"
    >
      <div className="relative">
        <Camera 
          style={{color: purpleColor}}
          size={24} 
          strokeWidth={2} 
        />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{backgroundColor: purpleColor}} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{backgroundColor: purpleColor}} />
        </span>
      </div>
      
      <div className="font-display text-xl flex items-center">
        <span className="text-white">Agenda</span>
        <span className="font-bold" style={{color: purpleColor}}>PRO</span>
      </div>
    </Link>
  );
};

export default LandingLogo; 