
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import ResponsiveContainer from '@/components/ResponsiveContainer';
import TabelasArquivamento from '@/components/dashboard/TabelasArquivamento';
import { useAuth } from '@/hooks/useAuth';

const ArquivamentoTabelas = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <ResponsiveContainer>
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Acesso restrito
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>É necessário estar autenticado para acessar esta página.</p>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    );
  }
  
  return (
    <ResponsiveContainer>
      <TabelasArquivamento />
    </ResponsiveContainer>
  );
};

export default ArquivamentoTabelas;
