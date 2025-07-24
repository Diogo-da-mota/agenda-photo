import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Images } from 'lucide-react';

const MonitorImagens = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="h-5 w-5" />
          Monitor de Imagens
        </CardTitle>
        <CardDescription>
          Monitore o status das suas imagens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Monitor de imagens em desenvolvimento...</p>
      </CardContent>
    </Card>
  );
};

export default MonitorImagens;