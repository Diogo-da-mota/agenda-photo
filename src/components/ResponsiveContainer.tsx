
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | '80%';
  customWidth?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '', 
  maxWidth = '6xl',
  customWidth = false
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
    '80%': 'w-full max-w-none md:w-4/5 lg:w-4/5 xl:w-4/5'
  };

  // Se customWidth for true, usa largura personalizada para desktop/tablet
  const widthClass = customWidth 
    ? 'w-full max-w-none md:w-4/5 lg:w-4/5 xl:w-4/5' 
    : maxWidthClasses[maxWidth];

  return (
    <div className={cn(
      'mx-auto px-2 sm:px-4 md:px-6 lg:px-8',
      widthClass,
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
