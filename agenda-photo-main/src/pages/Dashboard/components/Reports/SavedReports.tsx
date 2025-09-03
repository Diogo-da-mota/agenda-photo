import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SavedReportsProps {
  relatorios: any[];
  isLoading: boolean;
  formatarMoeda: (valor: number) => string;
}

export const SavedReports: React.FC<SavedReportsProps> = ({
  relatorios,
  isLoading,
  formatarMoeda
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">Relatórios Salvos</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          <span className="hidden md:inline">Histórico dos seus relatórios</span>
          <span className="md:hidden">Histórico</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : relatorios.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">Nenhum relatório salvo ainda.</p>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {relatorios.map((relatorio) => (
              <Card key={relatorio.id} className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm md:text-base">
                      Relatório {relatorio.tipo.charAt(0).toUpperCase() + relatorio.tipo.slice(1)}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Período: {relatorio.periodo}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-medium text-sm md:text-base">{formatarMoeda(relatorio.receita_total)}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      <span className="hidden md:inline">Criado em: </span>
                      {new Date(relatorio.criado_em!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};