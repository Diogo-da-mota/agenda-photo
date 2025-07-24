import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, Palette, Link as LinkIcon, Shield, Image } from 'lucide-react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySection from '@/components/configuracoes/CompanySection';
import { PreferencesSection } from '@/components/configuracoes/PreferencesSection';
import { IntegrationsSection } from '@/components/configuracoes/IntegrationsSection';
import { SecuritySection } from '@/components/configuracoes/SecuritySection';
import ImagesSection from '@/components/configuracoes/ImagesSection';
import { useAuth } from '@/hooks/useAuth';

const Configuracoes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verifica se o usuário é admin
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
  
  // Determinar a aba ativa baseada na rota atual
  const getActiveTab = () => {
    const path = location.pathname;
    switch (path) {
      case '/configuracoes-empresa':
        return 'empresa';
      case '/configuracoes-preferencias':
        return 'preferencias';
      case '/configuracoes-integracoes':
        return 'integracoes';
      case '/configuracoes-imagens':
        return 'imagens';
      case '/configuracoes-seguranca':
        return 'seguranca';
      default:
        return 'empresa';
    }
  };

  // Navegar para a rota amigável quando a aba mudar
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'empresa':
        navigate('/configuracoes-empresa');
        break;
      case 'preferencias':
        navigate('/configuracoes-preferencias');
        break;
      case 'integracoes':
        navigate('/configuracoes-integracoes');
        break;
      case 'imagens':
        navigate('/configuracoes-imagens');
        break;
      case 'seguranca':
        navigate('/configuracoes-seguranca');
        break;
      default:
        navigate('/configuracoes-empresa');
        break;
    }
  };
  return (
    <ResponsiveContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Configurações</h1>
        </div>

        <Tabs defaultValue={getActiveTab()} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6 bg-gray-800/70 p-1">
            <TabsTrigger value="empresa" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <Building size={16} />
              <span className="hidden md:inline">Empresa</span>
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger 
                  value="preferencias" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  <Palette size={16} />
                  <span className="hidden md:inline">Preferências</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="integracoes" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  <LinkIcon size={16} />
                  <span className="hidden md:inline">Integrações</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="imagens" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  <Image size={16} />
                  <span className="hidden md:inline">Imagens</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="seguranca" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  <Shield size={16} />
                  <span className="hidden md:inline">Segurança</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="empresa">
            <CompanySection />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="preferencias">
                <PreferencesSection />
              </TabsContent>

              <TabsContent value="integracoes">
                <IntegrationsSection />
              </TabsContent>
              
              <TabsContent value="imagens">
                <ImagesSection />
              </TabsContent>

              <TabsContent value="seguranca">
                <SecuritySection />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
};

export default Configuracoes;
