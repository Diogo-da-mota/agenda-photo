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
      <CardHeader className="pb-4">
        <CardTitle className="text-green-800 flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-green-200">
            <Camera className="h-5 w-5 text-green-700" />
          </div>
          Galeria Criada com Sucesso!
        </CardTitle>
        <CardDescription className="text-green-700 text-base">
          Sua galeria foi criada e está pronta para ser compartilhada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate(galeriaUrl)}
            className="flex-1 h-11 bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visualizar Galeria
          </Button>
          <Button
            variant="outline"
            onClick={onCopyLink}
            className="flex-1 h-11 border-green-300 text-green-700 hover:bg-green-100"
          >
            Copiar Link
          </Button>
        </div>
        <div className="p-4 bg-white rounded-lg border border-green-200 text-sm font-mono break-all shadow-inner">
          {window.location.origin}{galeriaUrl}
        </div>
      </CardContent>
    </Card>
  );
};

export default GaleriaSucesso;