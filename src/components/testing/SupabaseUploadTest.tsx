import React, { useState } from 'react';
import { useSupabaseStorageUpload } from '@/hooks/useSupabaseStorageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Upload, Clock, Server, LinkIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * Componente de teste aprimorado para o Supabase Storage.
 */
export function SupabaseUploadTest() {
  const { status, uploadFiles } = useSupabaseStorageUpload();
  const { isUploading, progress, error, results } = status;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Upload iniciado - logs removidos para produção
    const result = await uploadFiles(files);
    
    if (result?.success) {
      // Upload bem-sucedido - logs removidos para produção
    } else {
      // Falha no upload - logs removidos para produção
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-green-500" />
            Teste de Upload - Supabase Storage (Aprimorado)
          </CardTitle>
          <CardDescription>
            Teste o sistema de upload com verificação de bucket e melhor tratamento de erros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando...</span>
                <span>{progress?.percentage || 0}%</span>
              </div>
              <Progress value={progress?.percentage || 0} className="w-full" />
              {progress?.currentFileName && <p className="text-sm text-gray-500">Arquivo: {progress.currentFileName}</p>}
            </div>
          )}
        </CardContent>
      </Card>
      
      {error && !isUploading && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro na Operação</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Resultados do Upload</CardTitle>
          </CardHeader>
          <CardContent>
            {results.urls.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-green-700">Arquivos Enviados com Sucesso:</h4>
                {results.urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      {url}
                    </a>
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="mt-4 space-y-3">
                 <Separator />
                <h4 className="font-medium text-red-700">Arquivos com Falha:</h4>
                {results.errors.map((err, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-red-50">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <div className="text-sm">
                      <p className="font-semibold">{err.file}</p>
                      <p className="text-red-700">{err.error}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SupabaseUploadTest;