
import React, { lazy, Suspense } from 'react';

// Importação correta do recharts - importar tudo de uma vez para evitar React Error #130
const RechartsComponents = lazy(() => import('recharts'));

interface UploadChartsProps {
  uploadTimes: Array<{ name: string; tempo: number }>;
}

// Componente de loading para gráficos
const ChartLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Carregando gráfico...</span>
  </div>
);

const UploadCharts: React.FC<UploadChartsProps> = ({ uploadTimes }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Tempo de Upload (últimos 7 dias)</h3>
        <div className="h-64">
          <Suspense fallback={<ChartLoader />}>
            <RechartsComponents>
              {(recharts) => {
                const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={uploadTimes}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Tempo (ms)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tempo" name="Tempo médio (ms)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              }}
            </RechartsComponents>
          </Suspense>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Taxa de Compressão por Tipo</h3>
        <div className="h-64">
          <Suspense fallback={<ChartLoader />}>
            <RechartsComponents>
              {(recharts) => {
                const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { type: 'JPEG', ratio: 52 },
                        { type: 'PNG', ratio: 65 },
                        { type: 'WebP', ratio: 32 },
                        { type: 'GIF', ratio: 15 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis label={{ value: 'Economia (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ratio" name="Taxa de Compressão (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              }}
            </RechartsComponents>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default UploadCharts;
