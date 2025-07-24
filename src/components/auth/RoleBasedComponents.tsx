import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface RoleBasedProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requirePermission?: keyof import('@/hooks/useUserPermissions').UserPermissions;
  fallback?: React.ReactNode;
}

export const RoleBased: React.FC<RoleBasedProps> = ({
  children,
  allowedRoles = [],
  requirePermission,
  fallback = null
}) => {
  const { role, loading: roleLoading } = useUserRole();
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  if (roleLoading || permissionsLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  // Verificar por papel específico
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // Verificar por permissão específica
  if (requirePermission && !permissions[requirePermission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleBased allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleBased>
  );
};

interface ModeratorPlusProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ModeratorPlus: React.FC<ModeratorPlusProps> = ({ children, fallback = null }) => {
  return (
    <RoleBased allowedRoles={['admin', 'moderador']} fallback={fallback}>
      {children}
    </RoleBased>
  );
};