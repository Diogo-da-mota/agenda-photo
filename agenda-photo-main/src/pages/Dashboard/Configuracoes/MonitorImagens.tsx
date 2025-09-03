
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ImageUploadMonitoring from '@/components/ImageUploadMonitoring';
import ImageUploadBatch from '@/components/ImageUploadBatch';
import ImageUploadDocs from '@/components/documentation/ImageUploadDocs';

const MonitorImagens: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/dashboard/configuracoes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Monitoramento de Imagens</h1>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="batch">Upload em Lote</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <ImageUploadMonitoring />
        </TabsContent>
        
        <TabsContent value="batch" className="space-y-6">
          <ImageUploadBatch />
        </TabsContent>
        
        <TabsContent value="docs" className="space-y-6">
          <ImageUploadDocs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitorImagens;
