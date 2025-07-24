import { useCallback } from 'react';
import { useEnhancedSecurity } from './useEnhancedSecurity';
import { supabase } from '@/lib/supabase';
import { securityLogger } from '@/utils/securityLogger';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const useSecureUpload = () => {
  const { validateFileUpload, logSecurityEvent } = useEnhancedSecurity();

  const uploadFile = useCallback(async (
    file: File, 
    bucket: string, 
    path: string,
    userEmail?: string
  ): Promise<UploadResult> => {
    try {
      // 1. Validar arquivo antes do upload
      const validation = await validateFileUpload(file);
      if (!validation.valid) {
        securityLogger.logSuspiciousActivity('INVALID_FILE_UPLOAD_ATTEMPT', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: validation.error
        }, userEmail);
        
        return {
          success: false,
          error: validation.error
        };
      }

      // 2. Log da tentativa de upload
      if (userEmail) {
        securityLogger.logFileOperation('upload', file.name, userEmail, false);
      }

      // 3. Upload seguro para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            uploadedAt: new Date().toISOString(),
            originalName: file.name,
            size: file.size.toString(),
            type: file.type
          }
        });

      if (error) {
        // Log de erro de upload
        await logSecurityEvent('FILE_UPLOAD_ERROR', {
          fileName: file.name,
          bucket,
          path,
          error: error.message
        });

        return {
          success: false,
          error: `Erro no upload: ${error.message}`
        };
      }

      // 4. Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // 5. Log de sucesso
      if (userEmail) {
        securityLogger.logFileOperation('upload', file.name, userEmail, true);
      }

      await logSecurityEvent('FILE_UPLOAD_SUCCESS', {
        fileName: file.name,
        bucket,
        path: data.path,
        url: urlData.publicUrl
      });

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error: any) {
      // Log de erro crítico
      securityLogger.logSuspiciousActivity('FILE_UPLOAD_CRITICAL_ERROR', {
        fileName: file.name,
        bucket,
        path,
        error: error.message
      }, userEmail);

      return {
        success: false,
        error: 'Erro crítico no upload do arquivo'
      };
    }
  }, [validateFileUpload, logSecurityEvent]);

  const deleteFile = useCallback(async (
    bucket: string, 
    path: string,
    userEmail?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Log da tentativa de exclusão
      if (userEmail) {
        securityLogger.logFileOperation('delete', path, userEmail, false);
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        await logSecurityEvent('FILE_DELETE_ERROR', {
          bucket,
          path,
          error: error.message
        });

        return {
          success: false,
          error: `Erro ao deletar arquivo: ${error.message}`
        };
      }

      // Log de sucesso
      if (userEmail) {
        securityLogger.logFileOperation('delete', path, userEmail, true);
      }

      await logSecurityEvent('FILE_DELETE_SUCCESS', {
        bucket,
        path
      });

      return { success: true };

    } catch (error: any) {
      securityLogger.logSuspiciousActivity('FILE_DELETE_CRITICAL_ERROR', {
        bucket,
        path,
        error: error.message
      }, userEmail);

      return {
        success: false,
        error: 'Erro crítico ao deletar arquivo'
      };
    }
  }, [logSecurityEvent]);

  return {
    uploadFile,
    deleteFile
  };
};