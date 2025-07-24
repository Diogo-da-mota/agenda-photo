import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarFooterProps {
  isOpen: boolean;
  closeMobileSidebar: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isOpen,
  closeMobileSidebar
}) => {
  const { user } = useAuth();
  
  // Não mostrar o rodapé se não houver usuário logado
  if (!user) return null;
  
  // Removido botão de sincronização conforme solicitado
  return null;
};

export default SidebarFooter; 