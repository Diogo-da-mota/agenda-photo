
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Palette, Code, Share2, ExternalLink, Upload, Image as ImageIcon } from "lucide-react";
import ImageGallery from '@/components/ImageGallery';
import { useToast } from '@/hooks/use-toast';

const Site: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("portfolio");

  
  const handleImageUploaded = () => {
    toast({
      title: "Imagem adicionada",
      description: "A imagem foi adicionada ao seu portfólio com sucesso."
    });
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Meu Site</h1>
          <p className="mt-1 text-lg text-gray-400">
            Gerencie o portfólio e conteúdo do seu site de fotografia
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button variant="outline" className="gap-1">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
          <Button className="gap-1">
            <ExternalLink className="h-4 w-4" />
            Ver Site
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-gray-800 text-gray-300">
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <ImageIcon className="h-4 w-4 mr-2" />
            Portfólio
          </TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Palette className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="integracao" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Code className="h-4 w-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="dominio" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Globe className="h-4 w-4 mr-2" />
            Domínio
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Portfólio de Fotografia</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie as imagens que serão exibidas no seu portfólio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button className="gap-2 w-full sm:w-auto">
                  <Upload className="h-4 w-4" />
                  Adicionar Novas Fotos
                </Button>
              </div>
              
              <ImageGallery 
                refreshTrigger={refreshTrigger}
                emptyMessage="Seu portfólio está vazio. Adicione fotos para exibir em seu site."
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400">
                Arraste e solte as imagens para reorganizar
              </p>
              <Button variant="outline" size="sm">
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="design" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Personalização do Site</CardTitle>
              <CardDescription className="text-gray-400">
                Altere cores, fontes e layout do seu site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Temas Disponíveis</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {["Minimalista", "Elegante", "Moderno", "Artístico"].map(tema => (
                        <div key={tema} className="border border-gray-600 rounded-md p-3 cursor-pointer hover:border-primary flex items-center justify-center h-24">
                          <span className="text-gray-300">{tema}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Visualização</h3>
                    <div className="border border-gray-600 rounded-md h-52 flex items-center justify-center">
                      <span className="text-gray-400">Prévia do tema selecionado</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-700 pt-4">
              <Button>Aplicar Tema</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integracao" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Integrações Disponíveis</CardTitle>
              <CardDescription className="text-gray-400">
                Conecte seu site com outras plataformas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { nome: "Instagram", desc: "Exiba suas postagens mais recentes" },
                  { nome: "WhatsApp", desc: "Botão de contato direto" },
                  { nome: "Facebook", desc: "Compartilhamento e pixels" },
                  { nome: "Google Analytics", desc: "Estatísticas de visitas" }
                ].map(item => (
                  <div key={item.nome} className="border border-gray-600 rounded-lg p-4">
                    <h3 className="text-white font-medium">{item.nome}</h3>
                    <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                    <Button size="sm" variant="outline" className="mt-3">Conectar</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dominio" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Configurações de Domínio</CardTitle>
              <CardDescription className="text-gray-400">
                Conecte seu site a um domínio personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-md">
                <h3 className="text-white font-medium">Domínio atual</h3>
                <p className="text-blue-400 underline mt-1">seunome.portfoliofoto.com</p>
                <p className="text-sm text-gray-300 mt-2">
                  Este é seu domínio gratuito. Para uma presença profissional, conecte seu próprio domínio.
                </p>
              </div>
              
              <div className="border border-gray-600 rounded-md p-4">
                <h3 className="text-white font-medium">Conectar domínio personalizado</h3>
                <p className="text-sm text-gray-300 mt-1 mb-3">
                  Utilize seu próprio domínio para seu site de fotografia.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="seudominio.com.br" 
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm"
                  />
                  <Button>Conectar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Site;
