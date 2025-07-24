
import React from 'react';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Componente de Logo principal do sistema
 * Usado no dashboard e áreas internas
 */
const Logo: React.FC = () => {
  return (
    <Link 
      to="/dashboard" 
      className="flex items-center gap-2 font-medium transition-all duration-300 hover:opacity-80"
    >
      <div className="relative">
        <Camera 
          className="h-6 w-6 text-blue-600 dark:text-blue-400" 
          strokeWidth={2} 
        />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
      </div>
      
      <div className="font-display text-xl flex items-center">
        <span className="text-slate-900 dark:text-white">Agenda</span>
        <span className="font-bold text-purple-600 dark:text-purple-400">PRO</span>
      </div>
    </Link>
  );
};

export default Logo;
