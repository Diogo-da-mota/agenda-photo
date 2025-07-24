
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CompanyLogo from './CompanyLogo';
import CompanyForm from './CompanyForm';
import { CompanyData } from './types';
import { processEmojisForWhatsApp, encodeTextWithEmojisForURL } from '@/utils/emojiUtils';

export const CompanySection = () => {
  const { toast } = useToast();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "Estúdio Fotográfico",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zip: "01234-567",
    phone: "(11) 3456-7890",
    whatsapp: "(11) 98765-4321",
    email: "contato@estudiofotografico.com"
  });

  const handleCompanyDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCompany = () => {
    toast({
      title: "Dados da empresa atualizados",
      description: "As informações da empresa foram salvas com sucesso.",
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = companyData.whatsapp.replace(/\D/g, '');
    if (phoneNumber) {
      // Mensagem padrão com emojis
      const mensagemTexto = "Olá! Entrando em contato através do site da empresa. Como posso ajudar? 😊";
      
      // Processar emojis para garantir compatibilidade com WhatsApp
      const mensagemProcessada = processEmojisForWhatsApp(mensagemTexto);
      
      // Codificar mensagem preservando emojis
      const mensagemCodificada = encodeTextWithEmojisForURL(mensagemProcessada);
      
      window.open(`https://wa.me/55${phoneNumber}?text=${mensagemCodificada}`, '_blank');
    } else {
      toast({
        title: "Número de WhatsApp não configurado",
        description: "Por favor, adicione um número de WhatsApp válido.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Empresa</CardTitle>
        <CardDescription>Configure as informações da sua empresa ou negócio.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <CompanyLogo 
            companyLogo={companyLogo} 
            setCompanyLogo={setCompanyLogo} 
          />
          
          <CompanyForm 
            companyData={companyData}
            handleCompanyDataChange={handleCompanyDataChange}
            openWhatsApp={openWhatsApp}
          />
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveCompany}>
            <Save size={16} className="mr-2" />
            Salvar alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
