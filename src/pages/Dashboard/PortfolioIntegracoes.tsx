import React from 'react';
import { useLocation } from 'react-router-dom';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import PortfolioNavBar from '@/components/portfolio/PortfolioNavBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PortfolioIntegracoes: React.FC = () => {
  const location = useLocation();
  const activeTab = 'integracoes';

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Portfólio</h1>
            <p className="text-muted-foreground">
              Conecte seu site com outras plataformas
            </p>
            
            {/* Barra de navegação personalizada */}
            <PortfolioNavBar 
              activeTab={activeTab} 
              className="mt-4 -mx-4 sm:-mx-0" 
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Integrações Disponíveis</CardTitle>
            <CardDescription>
              Conecte seu site com outras plataformas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { nome: "Instagram", desc: "Exiba suas postagens mais recentes" },
                { nome: "WhatsApp", desc: "Botão de contato direto" },
                { nome: "Facebook", desc: "Compartilhamento e pixels" },
                { nome: "Google Analytics", desc: "Estatísticas de visitas" }
              ].map(item => (
                <div key={item.nome} className="border rounded-lg p-4">
                  <h3 className="font-medium">{item.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  <Button size="sm" variant="outline" className="mt-3">Conectar</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default PortfolioIntegracoes;
