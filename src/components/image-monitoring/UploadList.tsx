
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';

interface UploadItem {
  fileName: string;
  fileType: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  uploadDuration: number;
  success: boolean;
  date: string;
}

interface UploadListProps {
  uploads: UploadItem[];
  formatBytes: (bytes: number, decimals?: number) => string;
}

const UploadList: React.FC<UploadListProps> = ({ uploads, formatBytes }) => {
  if (!uploads || uploads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum upload encontrado
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Arquivo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Tamanho Original</TableHead>
            <TableHead>Tamanho Comprimido</TableHead>
            <TableHead>Compressão</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.map((upload, index) => (
            <TableRow key={index}>
              <TableCell>
                {upload.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <span className="truncate max-w-[150px]" title={upload.fileName}>
                    {upload.fileName}
                  </span>
                  {upload.success && (
                    <a href="#" className="ml-2 text-blue-500 hover:text-blue-700">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {upload.fileType.split('/')[1]?.toUpperCase() || upload.fileType}
                </Badge>
              </TableCell>
              <TableCell>{formatBytes(upload.originalSize)}</TableCell>
              <TableCell>{formatBytes(upload.compressedSize)}</TableCell>
              <TableCell>
                <Badge variant={upload.compressionRatio > 50 ? "secondary" : "outline"}>
                  {upload.compressionRatio}%
                </Badge>
              </TableCell>
              <TableCell>{(upload.uploadDuration / 1000).toFixed(2)}s</TableCell>
              <TableCell>{upload.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UploadList;
