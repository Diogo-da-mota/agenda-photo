import React from 'react';
import { Phone, Instagram, Globe } from 'lucide-react';
import { useEmpresa } from '@/hooks/useEmpresa';

interface PortfolioFooterProps {
  telefone?: string;
  instagram?: string;
  site?: string;
  nome?: string;
}

export function PortfolioFooter({
  telefone,
  instagram,
  site,
  nome
}: PortfolioFooterProps) {
  const { configuracoes } = useEmpresa();
  
  const displayTelefone = telefone || configuracoes?.telefone || '64993266649';
  const displayInstagram = instagram || configuracoes?.instagram || '@diogo.goncalves_fotografo';
  const displaySite = site || configuracoes?.site || '';
  const displayNome = nome || configuracoes?.nome_empresa || 'Diogo Fotografia';
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card text-card-foreground py-8">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-xl font-medium mb-6">Entre em contato para orçamentos</h3>
        
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
          {displayTelefone && (
            <a href={`tel:${displayTelefone}`} className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors">
              <Phone size={18} />
              <span>{displayTelefone}</span>
            </a>
          )}
          
          {displaySite && (
            <a href={displaySite.startsWith('http') ? displaySite : `https://${displaySite}`} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors">
              <Globe size={18} />
              <span>Site</span>
            </a>
          )}
          
          {displayInstagram && (
            <a href={displayInstagram.startsWith('http') ? displayInstagram : `https://instagram.com/${displayInstagram.replace('@', '')}`}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors">
              <Instagram size={18} />
              <span>{displayInstagram}</span>
            </a>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          © {currentYear} {displayNome}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
} 