import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useUserRole = () => {
  const [role, setRole] = useState<string>('usuario');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineUserRole = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
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
  }, []);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
};