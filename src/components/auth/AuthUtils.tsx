import React, { ReactNode } from 'react';
import { AlertCircle } from "lucide-react";
import { GooeyModal } from '@/components/ui/gooey-modal';

interface AuthModalLayoutProps {
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  footerText: string;
  footerActionText: string;
  onFooterActionClick: () => void;
}

export const AuthModalLayout: React.FC<AuthModalLayoutProps> = ({
  children,
  isOpen,
  onOpenChange,
  title,
  footerText,
  footerActionText,
  onFooterActionClick
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  const footerContent = (
    <div className="text-center text-sm text-gray-300">
      {footerText}{" "}
      <button 
        type="button"
        onClick={onFooterActionClick}
        className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
      >
        {footerActionText}
      </button>
    </div>
  );

  return (
    <GooeyModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footerContent={footerContent}
    >
      {children}
    </GooeyModal>
  );
};

export const ErrorAlert: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded-md flex items-start">
      <AlertCircle className="text-red-400 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
      <span className="text-sm text-red-300">{error}</span>
    </div>
  );
};

// Os componentes SocialLoginButtons e SocialAuthDivider não são mais necessários
// e foram removidos para limpar o código
