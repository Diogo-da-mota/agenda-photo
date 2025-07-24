import React from 'react';
import { Phone, Globe, Instagram, Camera, Grid3X3, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEmpresa } from '@/hooks/useEmpresa';

interface PortfolioHeaderProps {
  nomeFotografo?: string;
  slogan?: string;
  telefone?: string;
  instagram?: string;
  site?: string;
  trabalhosRealizados?: number;
  especialidades?: number;
  anosExperiencia?: number;
}

export function PortfolioHeader({
  nomeFotografo,
  slogan,
  telefone,
  instagram,
  site,
  trabalhosRealizados = 0,
  especialidades = 0,
  anosExperiencia = 0
}: PortfolioHeaderProps) {
  const { configuracoes } = useEmpresa();
  
  // Usar dados da empresa se não forem fornecidos explicitamente
  const displayNome = nomeFotografo || configuracoes?.nome_empresa || 'Diogo Fotografia';
  const displaySlogan = slogan || 'Capturando momentos únicos e especiais';
  const displayTelefone = telefone || configuracoes?.telefone || '';
  const displayInstagram = instagram || configuracoes?.instagram || '';
  const displaySite = site || configuracoes?.site || '';
  
  return (
    <header className="bg-card text-card-foreground py-8">
      <div className="container mx-auto px-4 text-center">
        {/* Nome e Slogan */}
        <h1 className="text-4xl font-bold mb-2">{displayNome}</h1>
        <p className="text-lg text-muted-foreground mb-12">{displaySlogan}</p>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-secondary rounded-full p-4 mb-2">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{trabalhosRealizados}+</h3>
            <p className="text-sm text-muted-foreground">Trabalhos Realizados</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-secondary rounded-full p-4 mb-2">
              <Grid3X3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{especialidades}</h3>
            <p className="text-sm text-muted-foreground">Especialidades</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-secondary rounded-full p-4 mb-2">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{anosExperiencia}+</h3>
            <p className="text-sm text-muted-foreground">Anos de Experiência</p>
          </div>
        </div>
      </div>
    </header>
  );
} 