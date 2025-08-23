import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Camera, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GaleriaSucessoProps {
  galeriaUrl: string;
  senha?: string;
  onCopyLink: () => void;
  onNovaGaleria?: () => void;
}

const GaleriaSucesso: React.FC<GaleriaSucessoProps> = ({
  galeriaUrl,
  senha,
  onCopyLink,
  onNovaGaleria
}) => {
  const navigate = useNavigate();

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-green-800 flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <div className="p-1.5 sm:p-2 rounded-lg bg-green-200">
            <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
          </div>
          <span className="hidden sm:inline">Galeria Criada com Sucesso!</span>
          <span className="sm:hidden">Galeria Criada!</span>
        </CardTitle>
        <CardDescription className="text-green-700 text-sm sm:text-base">
          <span className="hidden sm:inline">Sua galeria foi criada e está pronta para ser compartilhada</span>
          <span className="sm:hidden">Galeria pronta para compartilhar</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={() => navigate(galeriaUrl)}
            className="flex-1 h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-sm sm:text-base"
          >
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Visualizar Galeria</span>
            <span className="sm:hidden">Ver Galeria</span>
          </Button>
          <Button
            variant="outline"
            onClick={onCopyLink}
            className="flex-1 h-10 sm:h-11 border-green-300 text-green-700 hover:bg-green-100 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Copiar Link</span>
            <span className="sm:hidden">Copiar</span>
          </Button>
        </div>
        <div className="p-3 sm:p-4 bg-white rounded-lg border border-green-200 text-xs sm:text-sm font-mono break-all shadow-inner">
          {window.location.origin}{galeriaUrl}
        </div>
      </CardContent>
    </Card>
  );
};

export default GaleriaSucesso;