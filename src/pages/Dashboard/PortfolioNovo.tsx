
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import TrabalhoForm from '@/components/portfolio/TrabalhoForm';
import { criarTrabalhoComImagens } from '@/services/portfolioService';
import { CriarTrabalhoComImagens } from '@/services/portfolioService';

import { useAuth } from '@/hooks/useAuth';

const PortfolioNovo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSaveWithImages = async (trabalhoData: CriarTrabalhoComImagens) => {
    if (!user?.id) {
      console.error('Usuário não autenticado');
      return;
    }

    try {
      await criarTrabalhoComImagens(trabalhoData, user.id);
      navigate('/portfolio');
    } catch (error) {
      console.error('Erro ao criar trabalho:', error);
    }
  };

  const handleCancel = () => {
    navigate('/portfolio');
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/portfolio')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Trabalho</h1>
            <p className="text-muted-foreground">
              Adicione um novo trabalho ao seu portfólio
            </p>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Trabalho</CardTitle>
          </CardHeader>
          <CardContent>
            <TrabalhoForm
              onSaveWithImages={handleSaveWithImages}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default PortfolioNovo;
