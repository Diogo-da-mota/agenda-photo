import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CSRFProvider } from "@/components/security";
import AppRoutes from "./components/AppRoutes";
import { useState } from 'react';

import OfflineIndicator from '@/components/ui/OfflineIndicator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { createQueryClient } from "./lib/react-query-config";
import { useIsMobile } from "./hooks/use-mobile";

// A criação do client foi movida para dentro do componente App
// para usar o hook useIsMobile e aplicar a lógica de cache dinâmica.

// Componente interno simplificado
const AppWithRoutes = () => {
  return <AppRoutes />;
};

const App = () => {
  const isMobile = useIsMobile();
  
  // Usamos useState para garantir que a instância do QueryClient seja criada
  // apenas uma vez durante o ciclo de vida do componente.
  const [queryClient] = useState(() => createQueryClient(isMobile));

  // Log apenas em desenvolvimento
  if (import.meta.env.MODE === 'development') {
    console.log('App inicializando...', { isMobile });
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
          }}>
            <CSRFProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <OfflineIndicator />
                  <AppWithRoutes />
                </TooltipProvider>
              </AuthProvider>
            </CSRFProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
