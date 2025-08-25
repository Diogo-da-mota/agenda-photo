
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

// Import our new components
import StatsOverview from "./image-monitoring/StatsOverview";
import UploadHistory from "./image-monitoring/UploadHistory";
import UploadCharts from "./image-monitoring/UploadCharts";
import UploadSection from "./image-monitoring/UploadSection";
import { formatBytes, getMockUploadTimes, getMockRecentUploads, getDefaultStats } from "./image-monitoring/utils";

// Types
interface UploadMetric {
  fileName: string;
  fileType: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  uploadDuration: number;
  success: boolean;
  date: string;
}

// Main component
const ImageUploadMonitoring: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentUploads, setRecentUploads] = useState<UploadMetric[]>([]);
  const [uploadTimes, setUploadTimes] = useState<any[]>([]);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load stats and upload history
  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Use mock data for now
      setStats(getDefaultStats());
      setRecentUploads(getMockRecentUploads());
      setUploadTimes(getMockUploadTimes());
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      
      // Use mock data on error
      setStats(getDefaultStats());
      setRecentUploads(getMockRecentUploads());
      setUploadTimes(getMockUploadTimes());
      
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Usando dados de demonstração",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh stats
  const handleRefreshStats = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await loadStats();

    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as estatísticas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upload complete
  const handleUploadComplete = (url: string) => {
    console.log('Upload completed with url:', url);

    // Update stats after upload
    handleRefreshStats();
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Carregando estatísticas...</CardTitle>
          <CardDescription>Coletando dados de monitoramento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={75} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monitoramento de Uploads</CardTitle>
            <CardDescription>Estatísticas e métricas de performance dos uploads de imagens</CardDescription>
          </div>
          <button 
            onClick={handleRefreshStats}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Atualizar estatísticas"
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
              <TabsTrigger value="upload">Novo Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <StatsOverview stats={stats} />
            </TabsContent>
            
            <TabsContent value="history">
              <UploadHistory uploads={recentUploads} formatBytes={formatBytes} />
            </TabsContent>
            
            <TabsContent value="charts">
              <UploadCharts uploadTimes={uploadTimes} />
            </TabsContent>
            
            <TabsContent value="upload">
              <UploadSection onUploadComplete={handleUploadComplete} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadMonitoring;
