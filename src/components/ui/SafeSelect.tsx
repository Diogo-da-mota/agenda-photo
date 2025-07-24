import React, { forwardRef, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectProps
} from '@/components/ui/select';
import { useSelectPortal } from '@/hooks/useSelectPortal';
import { PortalErrorBoundary } from '@/components/ui/PortalErrorBoundary';

interface SafeSelectProps extends SelectProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
  fallbackMessage?: string;
}

/**
 * Componente Select seguro que previne erros de portal DOM
 * Wrapper do Radix Select com gerenciamento robusto de portais
 */
export const SafeSelect = forwardRef<HTMLButtonElement, SafeSelectProps>((
  { 
    placeholder = "Selecione uma opção", 
    className = "w-full", 
    children, 
    fallbackMessage = "Seletor temporariamente indisponível",
    onOpenChange,
    ...props 
  }, 
  ref
) => {
  const { key, handleOpenChange } = useSelectPortal();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const combinedOpenChange = (open: boolean) => {
    if (!mountedRef.current) return;
    
    handleOpenChange(open);
    onOpenChange?.(open);
  };

  return (
    <PortalErrorBoundary 
      fallback={
        <div className="p-2 text-sm text-muted-foreground border border-dashed rounded">
          <span className="text-yellow-600">⚠️</span> {fallbackMessage}
        </div>
      }
    >
      <div key={`safe-select-wrapper-${key}`}>
        <Select 
          key={`safe-select-${key}`}
          ref={ref}
          onOpenChange={combinedOpenChange}
          {...props}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent 
            className="bg-background border shadow-md z-[100]"
            side="bottom"
            align="start"
            sideOffset={4}
            avoidCollisions={true}
            collisionPadding={8}
            onCloseAutoFocus={(e) => {
              // Prevenir foco automático que pode causar conflitos
              e.preventDefault();
            }}
          >
            {children}
          </SelectContent>
        </Select>
      </div>
    </PortalErrorBoundary>
  );
});

SafeSelect.displayName = "SafeSelect";

// Exportar também o SelectItem para conveniência
export { SelectItem } from '@/components/ui/select';