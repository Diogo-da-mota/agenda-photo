
import React from 'react';
import { Moon, Bell, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const PreferencesSection = () => {
  // Simplified version without the problematic hook
  const [settings, setSettings] = React.useState({
    modo_escuro: false,
    notificacoes: true,
    idioma: 'pt-BR'
  });
  const [loading, setLoading] = React.useState(false);

  const handlePreferenceToggle = async (field: 'modo_escuro' | 'notificacoes', value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = async (value: string) => {
    setSettings(prev => ({ ...prev, idioma: value }));
  };

  if (loading) {
    return (
      <Card className="border-gray-700/50 bg-gray-850/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-700/50 bg-gray-850/40">
      <CardHeader>
        <CardTitle className="text-xl text-white">Personalização e Preferências</CardTitle>
        <CardDescription className="text-gray-300">Ajuste o sistema de acordo com suas preferências.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-blue-400" />
              <div>
                <Label htmlFor="dark-mode" className="text-base text-white">Modo Escuro</Label>
                <p className="text-sm text-gray-300">Ative para usar o tema escuro em todo o sistema</p>
              </div>
            </div>
            <Switch 
              id="dark-mode" 
              checked={settings.modo_escuro}
              onCheckedChange={(checked) => handlePreferenceToggle('modo_escuro', checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          
          <Separator className="bg-gray-700/50" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-blue-400" />
              <div>
                <Label htmlFor="notifications" className="text-base text-white">Notificações</Label>
                <p className="text-sm text-gray-300">Receba alertas de lembretes e pagamentos</p>
              </div>
            </div>
            <Switch 
              id="notifications" 
              checked={settings.notificacoes}
              onCheckedChange={(checked) => handlePreferenceToggle('notificacoes', checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          
          <Separator className="bg-gray-700/50" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-blue-400" />
              <div>
                <Label className="text-base text-white">Idioma do Sistema</Label>
                <p className="text-sm text-gray-300">Escolha o idioma de sua preferência</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button 
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  settings.idioma === "pt-BR" 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "text-white border border-gray-600 hover:bg-gray-700"
                }`}
                onClick={() => handleLanguageChange("pt-BR")}
              >
                Português
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  settings.idioma === "en-US" 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "text-white border border-gray-600 hover:bg-gray-700"
                }`}
                onClick={() => handleLanguageChange("en-US")}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
