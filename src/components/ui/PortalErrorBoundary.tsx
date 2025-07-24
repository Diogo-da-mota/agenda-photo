import React from 'react';

interface PortalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PortalErrorBoundary: React.FC<PortalErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  return <>{children}</>;
};

export default PortalErrorBoundary;