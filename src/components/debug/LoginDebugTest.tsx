import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';

const LoginDebugTest = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[LOGIN DEBUG] ${message}`);
  };

  const handleLoginClick = () => {
    addLog('Botão Login clicado');
    setIsLoginOpen(true);
    addLog(`Modal Login estado: ${true}`);
  };

  const handleRegisterClick = () => {
    addLog('Botão Registrar clicado');
    setIsRegisterOpen(true);
    addLog(`Modal Registro estado: ${true}`);
  };

  const handleLoginClose = (open: boolean) => {
    addLog(`Modal Login fechado: ${open}`);
    setIsLoginOpen(open);
  };

  const handleRegisterClose = (open: boolean) => {
    addLog(`Modal Registro fechado: ${open}`);
    setIsRegisterOpen(open);
  };

  const switchToRegister = () => {
    addLog('Alternando para registro');
    setIsLoginOpen(false);
    setTimeout(() => {
      setIsRegisterOpen(true);
    }, 100);
  };

  const switchToLogin = () => {
    addLog('Alternando para login');
    setIsRegisterOpen(false);
    setTimeout(() => {
      setIsLoginOpen(true);
    }, 100);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Debug - Sistema de Login</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Status Atual</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Modal Login:</strong> {isLoginOpen ? 'ABERTO' : 'FECHADO'}
          </div>
          <div>
            <strong>Modal Registro:</strong> {isRegisterOpen ? 'ABERTO' : 'FECHADO'}
          </div>
        </div>
      </div>

      <div className="space-x-4">
        <Button onClick={handleLoginClick} variant="outline">
          Testar Login Modal
        </Button>
        <Button onClick={handleRegisterClick} variant="outline">
          Testar Registro Modal
        </Button>
        <Button onClick={() => setDebugLog([])} variant="ghost">
          Limpar Logs
        </Button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-60 overflow-y-auto">
        <h3 className="text-white mb-2">Log de Debug:</h3>
        {debugLog.length === 0 ? (
          <p className="text-gray-500">Nenhum log ainda...</p>
        ) : (
          debugLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))
        )}
      </div>

      {/* Modals de Teste */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onOpenChange={handleLoginClose}
        onRegisterClick={switchToRegister}
      />

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onOpenChange={handleRegisterClose}
        onLoginClick={switchToLogin}
      />
    </div>
  );
};

export default LoginDebugTest;