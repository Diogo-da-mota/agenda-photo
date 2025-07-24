
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlyerData } from '@/hooks/useFlyer';
import { Calendar, MapPin } from 'lucide-react';

interface FlyerPreviewProps {
  flyerData: FlyerData;
}

const FlyerPreview: React.FC<FlyerPreviewProps> = ({ flyerData }) => {
  const { cores = {}, nome_evento, cidade, data, detalhes } = flyerData;
  
  const bgColor = cores.background || '#111827';
  const primaryColor = cores.primary || '#3b82f6';
  const secondaryColor = cores.secondary || '#8b5cf6';
  const textColor = cores.text || '#ffffff';
  
  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização do Flyer</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div 
          className="w-full max-w-[350px] aspect-[3/4] rounded-lg overflow-hidden shadow-xl flex flex-col"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {/* Cabeçalho do Flyer */}
          <div style={gradientStyle} className="p-6 text-white">
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              {nome_evento || 'Nome do Evento'}
            </h2>
            {cidade && (
              <div className="flex items-center text-sm opacity-90">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{cidade}</span>
              </div>
            )}
            {data && (
              <div className="flex items-center text-sm opacity-90 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{data}</span>
              </div>
            )}
          </div>
          
          {/* Corpo do Flyer */}
          <div className="flex-1 p-6">
            {!nome_evento && !cidade && !data && !detalhes ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                <p>Personalize seu flyer editando os campos ao lado</p>
              </div>
            ) : (
              <>
                {detalhes && (
                  <div className="mt-4">
                    <p className="whitespace-pre-line">{detalhes}</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Rodapé do Flyer */}
          <div className="p-4 text-center text-sm opacity-80 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            www.seusite.com.br
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlyerPreview;
