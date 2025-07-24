
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  InfoIcon, 
  FileCode, 
  Database, 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle,
  CheckCircle,
  UploadCloud
} from "lucide-react";

const ImageUploadDocs = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileCode className="h-5 w-5 text-blue-500" />
          <CardTitle>Documentação Sistema de Upload</CardTitle>
        </div>
        <CardDescription>
          Guia técnico detalhado para o sistema de upload e monitoramento de imagens
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="flow">Fluxo Técnico</TabsTrigger>
            <TabsTrigger value="libraries">Bibliotecas</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-start space-x-2">
              <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium">Sistema de Upload e Processamento de Imagens</h3>
                <p className="text-sm text-muted-foreground">
                  O sistema implementa uma solução completa para upload de imagens com compressão automática,
                  armazenamento em serviço externo, persistência de metadados no Supabase e monitoramento
                  avançado de métricas de desempenho.
                </p>
              </div>
            </div>
            
            <Alert>
              <AlertTitle className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Principais Funcionalidades
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Upload de imagens individuais ou em lote</li>
                  <li>Compressão automática para otimizar o tamanho</li>
                  <li>Armazenamento em cloud via UploadThing</li>
                  <li>Geração de thumbnails para uso em galerias</li>
                  <li>Persistência de URLs e metadados no Supabase</li>
                  <li>Monitoramento detalhado de performance e operações</li>
                  <li>Mecanismos de recuperação de falhas e resiliência</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center text-blue-700 dark:text-blue-300">
                    <Upload className="h-4 w-4 mr-2" />
                    Frontend
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 px-4 text-sm text-blue-600 dark:text-blue-400">
                  Componentes React com feedback visual em tempo real, validação de arquivos e 
                  experiência de uso otimizada.
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center text-purple-700 dark:text-purple-300">
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Processamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 px-4 text-sm text-purple-600 dark:text-purple-400">
                  Serviços dedicados para compressão de imagens, criação de thumbnails
                  e upload para serviço cloud de armazenamento.
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center text-green-700 dark:text-green-300">
                    <Database className="h-4 w-4 mr-2" />
                    Backend
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 px-4 text-sm text-green-600 dark:text-green-400">
                  Integração com Supabase para persistência de dados, controle de acesso
                  baseado em usuário, e monitoramento de operações.
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="flow" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
                Fluxo Completo de Upload
              </h3>
              
              <div className="relative">
                <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 text-white font-medium">1</div>
                    <div className="ml-4 pt-1">
                      <h4 className="font-medium">Seleção e Validação</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        O usuário seleciona um arquivo de imagem que passa por validações
                        de tipo (JPEG, PNG, etc) e tamanho máximo permitido.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 text-white font-medium">2</div>
                    <div className="ml-4 pt-1">
                      <h4 className="font-medium">Compressão da Imagem</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        A imagem é processada para reduzir seu tamanho, mantendo qualidade aceitável.
                        O processo adapta parâmetros como dimensão e qualidade com base no tipo do arquivo.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 text-white font-medium">3</div>
                    <div className="ml-4 pt-1">
                      <h4 className="font-medium">Upload para UploadThing</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        A imagem comprimida é enviada para o serviço UploadThing via API,
                        que retorna uma URL pública permanente para o arquivo.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 text-white font-medium">4</div>
                    <div className="ml-4 pt-1">
                      <h4 className="font-medium">Criação de Thumbnail</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Uma versão menor da imagem (thumbnail) é gerada para uso em listagens
                        e galerias, otimizando a performance de carregamento.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 text-white font-medium">5</div>
                    <div className="ml-4 pt-1">
                      <h4 className="font-medium">Persistência no Supabase</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        A URL da imagem e outros metadados são armazenados na tabela 'imagens',
                        associados ao usuário autenticado.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 text-white font-medium">6</div>
                    <div className="ml-4 pt-1">
                      <h4 className="font-medium">Registro de Métricas</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Métricas de performance como tempo de upload, taxa de compressão e
                        status de operação são registradas para monitoramento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Alert className="mt-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Mecanismos de Fallback</AlertTitle>
                <AlertDescription>
                  O sistema possui mecanismos de contingência para situações de falha:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Timeout para uploads que demoram mais de 30 segundos</li>
                    <li>Fallback para dataUrl em caso de falha no serviço UploadThing</li>
                    <li>Segunda tentativa de compressão com parâmetros alternativos</li>
                    <li>Geração posterior de thumbnail em caso de falha inicial</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="libraries" className="space-y-4">
            <h3 className="text-lg font-medium">Bibliotecas e Tecnologias</h3>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge variant="outline" className="mr-2">Frontend</Badge>
                  React + TypeScript
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Componentes React para interface de usuário, com TypeScript para
                  tipagem forte e melhor DX.
                </p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge variant="outline" className="mr-2">UI</Badge>
                  Shadcn/UI + Tailwind CSS
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Sistema de componentes com design consistente e responsivo,
                  com estilização via Tailwind CSS.
                </p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge variant="outline" className="mr-2">API</Badge>
                  Supabase
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  PostgreSQL como banco de dados para armazenamento de metadados e URLs das imagens,
                  com autenticação e controle de acesso baseado em usuário (RLS).
                </p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge variant="outline" className="mr-2">Storage</Badge>
                  UploadThing
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Serviço de armazenamento de arquivos em nuvem, com API para upload
                  e geração de URLs públicas permanentes.
                </p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge variant="outline" className="mr-2">Processamento</Badge>
                  Browser Image Compression
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Biblioteca client-side para compressão e redimensionamento de imagens
                  antes do upload, reduzindo o consumo de banda e armazenamento.
                </p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge variant="outline" className="mr-2">Monitoramento</Badge>
                  Performance API + Logs Estruturados
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Utilização da Performance API do navegador para medição precisa de tempos
                  de processamento, com logs estruturados armazenados no Supabase.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monitoring" className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Sistema de Monitoramento
            </h3>
            
            <p className="text-sm text-muted-foreground">
              O sistema implementa monitoramento abrangente de métricas para garantir
              qualidade de serviço, identificar gargalos e manter histórico de operações.
            </p>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Métricas Rastreadas</h4>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Taxa de sucesso/falha dos uploads
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tempo médio de upload por arquivo
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tamanho das imagens antes e depois da compressão
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Taxa de compressão média
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tempo de operações de compressão
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Espaço total utilizado em armazenamento
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Logs e Eventos</h4>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Parâmetros e resultado da compressão
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Status de envio para o UploadThing
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Resultado da inserção no Supabase
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Erros e falhas com detalhamento
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Operações de CRUD na tabela 'imagens'
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tempo de execução de operações
                  </li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h4 className="font-medium mb-2">Implementação de Monitoramento</h4>
              <p className="text-sm text-muted-foreground">
                O monitoramento é implementado através de duas estratégias principais:
              </p>
              
              <ul className="mt-2 space-y-2">
                <li className="text-sm">
                  <span className="font-medium">1. Logs em tempo real:</span> Durante o processamento, 
                  eventos chave e métricas são registrados no console para depuração imediata.
                </li>
                <li className="text-sm">
                  <span className="font-medium">2. Persistência de métricas:</span> Métricas importantes
                  são armazenadas em registros específicos na tabela 'imagens', utilizando convenções
                  de nomenclatura para identificar registros de métricas vs. imagens reais.
                </li>
              </ul>
              
              <Alert className="mt-4">
                <AlertTitle>Visualização de Métricas</AlertTitle>
                <AlertDescription className="text-sm">
                  O componente <code>ImageUploadMonitoring</code> fornece uma interface para visualização
                  de estatísticas e métricas históricas de uploads, permitindo análise de performance
                  e identificação de problemas.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImageUploadDocs;
