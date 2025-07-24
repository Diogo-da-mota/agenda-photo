import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useUserRole = () => {
  const [role, setRole] = useState<string>('usuario');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const determineUserRole = () => {
      setLoading(true);
      try {
        if (!user) {
          setRole('usuario');
          return;
        }

        // Fonte da verdade: app_metadata, o padrão do Supabase para roles.
        // Isso centraliza a lógica e corrige a inconsistência.
        const userRoleFromMetadata = 
          user.app_metadata?.role || 
          user.user_metadata?.role || 
          'usuario';
        
        setRole(userRoleFromMetadata);

      } catch (error) {
        console.error('Erro ao determinar o papel do usuário a partir dos metadados:', error);
        setRole('usuario'); // Fallback seguro
      } finally {
        setLoading(false);
      }
    };

    determineUserRole();
  }, [user]);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
};