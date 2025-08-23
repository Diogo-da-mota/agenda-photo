import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar, Lock, Eye, Copy, Trash2, ImageIcon, Loader2, Camera, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GaleriaExistente {
  slug: string;
  titulo: string;
  data_criacao: string;
  total_fotos_real: number;
  data_expiracao?: string;
  total_acessos_galeria: number;
  ultima_atualizacao?: string;
  senha_acesso?: string;
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
  const { toast } = useToast();

  const copyPassword = async (senha: string) => {
    try {
      await navigator.clipboard.writeText(senha);
      toast({
        title: "Senha copiada!",
        description: "A senha foi copiada para a área de transferência.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a senha. Tente novamente.",
        variant: "destructive"
      });
    }
  };
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
      
      <div className="grid gap-3 sm:gap-4">
        {galerias.map((galeria) => (
          <Card key={galeria.slug} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg">{galeria.titulo}</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Criada em: </span>
                      {galeria.data_criacao ? new Date(galeria.data_criacao).toLocaleDateString('pt-BR') : 'Data não disponível'}
                    </span>
                    {galeria.total_fotos_real && (
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        {galeria.total_fotos_real} {galeria.total_fotos_real === 1 ? 'imagem' : 'imagens'}
                      </span>
                    )}
                    {galeria.data_expiracao && (
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Expira em: </span>
                        <span className="sm:hidden">Exp: </span>
                        {new Date(galeria.data_expiracao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{galeria.total_acessos_galeria || 0} visualizações</span>
                      <span className="sm:hidden">{galeria.total_acessos_galeria || 0} views</span>
                    </span>
                  </div>
                  {galeria.senha_acesso && (
                    <div className="flex items-center gap-2 font-medium text-blue-600">
                      <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Senha: {galeria.senha_acesso}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPassword(galeria.senha_acesso!)}
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                        title="Copiar senha"
                      >
                        <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  )}
                  {galeria.ultima_atualizacao && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <span className="hidden sm:inline">Última atualização: </span>
                      <span className="sm:hidden">Atualizada: </span>
                      {new Date(galeria.ultima_atualizacao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVisualizar(galeria.slug)}
                    className="flex items-center justify-center gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Visualizar</span>
                    <span className="sm:hidden">Ver Galeria</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopiarLink(galeria.slug)}
                    className="flex items-center justify-center gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Copiar Link</span>
                    <span className="sm:hidden">Copiar Link</span>
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
                    className="flex items-center justify-center gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Apagar</span>
                    <span className="sm:hidden">Apagar Galeria</span>
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