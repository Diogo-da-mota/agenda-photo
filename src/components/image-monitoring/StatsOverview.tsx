
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle, UploadCloud, Clock, HardDrive, FileType } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsProps {
  stats: {
    totalUploads: number;
    successfulUploads: number;
    failedUploads: number;
    averageUploadTime: number;
    totalStorageUsed: string;
    compressionRate: number;
    byFileType: Record<string, number>;
  };
}

const StatsOverview: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <div className="flex items-center">
          <UploadCloud className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Uploads</p>
            <h3 className="text-2xl font-bold">{stats.totalUploads}</h3>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <Check className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-500">{stats.successfulUploads} sucessos</span>
          <AlertTriangle className="h-4 w-4 text-amber-500 ml-3 mr-1" />
          <span className="text-amber-500">{stats.failedUploads} falhas</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-purple-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tempo Médio</p>
            <h3 className="text-2xl font-bold">{stats.averageUploadTime}s</h3>
          </div>
        </div>
        <div className="mt-2">
          <Progress 
            value={stats.averageUploadTime < 1 ? 90 : stats.averageUploadTime < 2 ? 70 : 50} 
            className="h-2"
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <div className="flex items-center">
          <HardDrive className="h-8 w-8 text-indigo-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Armazenamento</p>
            <h3 className="text-2xl font-bold">{stats.totalStorageUsed}</h3>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Economizados ~{stats.compressionRate}% com compressão
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <div className="flex items-center">
          <FileType className="h-8 w-8 text-emerald-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tipos de Arquivo</p>
            <h3 className="text-2xl font-bold">{Object.keys(stats.byFileType || {}).length}</h3>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(stats.byFileType || {}).slice(0, 3).map(([type, count]: [string, any]) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type.replace('image/', '')}: {count}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
