import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewAuditLogs: boolean;
  canManageSystem: boolean;
  isAdmin: boolean;
}

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    canManageUsers: false,
    canManageRoles: false,
    canViewAuditLogs: false,
    canManageSystem: false,
    isAdmin: false
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Verificar papel do usuário na nova tabela segura
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar permissões do usuário:', error);
          setLoading(false);
          return;
        }

        const role = data?.role || 'usuario';
        const isAdmin = role === 'admin';
        const isModerador = role === 'moderador';

        setPermissions({
          canManageUsers: isAdmin,
          canManageRoles: isAdmin,
          canViewAuditLogs: isAdmin || isModerador,
          canManageSystem: isAdmin,
          isAdmin
        });
      } catch (error) {
        console.error('Erro ao verificar permissões do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user?.id]);

  return { permissions, loading };
};