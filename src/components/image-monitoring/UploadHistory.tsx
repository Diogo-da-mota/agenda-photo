
import React from 'react';
import { Badge } from "@/components/ui/badge";

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

interface UploadHistoryProps {
  uploads: UploadMetric[];
  formatBytes: (bytes: number, decimals?: number) => string;
}

const UploadHistory: React.FC<UploadHistoryProps> = ({ uploads, formatBytes }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Arquivo</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-right">Tamanho Original</th>
              <th className="px-4 py-3 text-right">Comprimido</th>
              <th className="px-4 py-3 text-right">Economia</th>
              <th className="px-4 py-3 text-right">Tempo</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {uploads.map((upload, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 text-left">{upload.fileName}</td>
                <td className="px-4 py-3 text-left text-gray-500">{upload.fileType.replace('image/', '')}</td>
                <td className="px-4 py-3 text-right">{formatBytes(upload.originalSize)}</td>
                <td className="px-4 py-3 text-right">{formatBytes(upload.compressedSize)}</td>
                <td className="px-4 py-3 text-right">
                  {upload.success ? `${upload.compressionRatio}%` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-right">
                  {upload.success ? `${(upload.uploadDuration / 1000).toFixed(1)}s` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-center">
                  {upload.success ? (
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                      Sucesso
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                      Falha
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadHistory;
