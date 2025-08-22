
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

type LogEntry = {
  message: string;
  type: 'info' | 'error' | 'success';
};

interface DiagnosticLogProps {
  logs: LogEntry[];
}

const DiagnosticLog: React.FC<DiagnosticLogProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <Card className="mt-4 bg-black/95 border-none">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-white mb-2 flex items-center gap-1">
          📋 Log de operação:
        </div>
        <div className="space-y-1.5 font-mono text-xs overflow-auto max-h-80 text-white">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`py-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 
                'text-gray-200'
              }`}
            >
              {log.message}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticLog;
