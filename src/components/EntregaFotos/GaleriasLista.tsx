import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar, Lock, Eye, Copy, Trash2, ImageIcon, Loader2, Camera } from 'lucide-react';

interface GaleriaExistente {
  slug: string;
  titulo: string;
  data_criacao: string;
  total_fotos_real: number;
  data_expiracao?: string;
  total_acessos_galeria: number;
  ultima_atualizacao?: string;
}

interface GaleriasListaProps {
  galerias: GaleriaExistente[];
  loadingGalerias: boolean;
  onRecarregar: () => void;
  onVisualizar: (slug: string) => void;
  onCopiarLink: (slug: string) => void;
  onApagar: (slug: string, titulo: string, event?: React.MouseEvent) => void;
  onCriarPrimeira: () => void;
}

const GaleriasLista: React.FC<GaleriasListaProps> = ({
  galerias,
  loadingGalerias,
  onRecarregar,
  onVisualizar,
  onCopiarLink,
  onApagar,
  onCriarPrimeira
}) => {
  if (loadingGalerias) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando galerias...</span>
      </div>
    );
  }

  if (galerias.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma galeria encontrada</h3>
        <p className="text-muted-foreground mb-6">
          Você ainda não criou nenhuma galeria de fotos.
        </p>
        <Button 
          onClick={onCriarPrimeira}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Criar Primeira Galeria
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {galerias.length} galeria{galerias.length !== 1 ? 's' : ''} encontrada{galerias.length !== 1 ? 's' : ''}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRecarregar}
          disabled={loadingGalerias}
        >
          Atualizar
        </Button>
      </div>
      
      <div className="grid gap-4">
        {galerias.map((galeria) => (
          <Card key={galeria.slug} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{galeria.titulo}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Criada em: {galeria.data_criacao ? new Date(galeria.data_criacao).toLocaleDateString('pt-BR') : 'Data não disponível'}
                    </span>
                    {galeria.total_fotos_real && (
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <ImageIcon className="h-4 w-4" />
                        {galeria.total_fotos_real} {galeria.total_fotos_real === 1 ? 'imagem' : 'imagens'}
                      </span>
                    )}
                    {galeria.data_expiracao && (
                      <span className="flex items-center gap-1">
                        <Lock className="h-4 w-4" />
                        Expira em: {new Date(galeria.data_expiracao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {galeria.total_acessos_galeria || 0} visualizações
                    </span>
                  </div>
                  {galeria.ultima_atualizacao && (
                    <p className="text-sm text-muted-foreground">
                      Última atualização: {new Date(galeria.ultima_atualizacao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVisualizar(galeria.slug)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopiarLink(galeria.slug)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      try {
                        onApagar(galeria.slug, galeria.titulo, event);
                      } catch (error) {
                        console.error('Erro capturado no onClick:', error);
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    }}
                    disabled={loadingGalerias}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Apagar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GaleriasLista;