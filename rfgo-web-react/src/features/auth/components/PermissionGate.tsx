import React from 'react';
import { useUserStore, RoleName } from '../store/useUserStore';

interface PermissionGateProps {
  allowedRoles: RoleName[];
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  allowedRoles,
  children = null,
  fallback = null,
}) => {
  const hasRole = useUserStore((state) => state.hasRole);

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
