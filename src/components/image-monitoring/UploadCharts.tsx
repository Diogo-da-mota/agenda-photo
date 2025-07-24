
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UploadChartsProps {
  uploadTimes: Array<{ name: string; tempo: number }>;
}

const UploadCharts: React.FC<UploadChartsProps> = ({ uploadTimes }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Tempo de Upload (últimos 7 dias)</h3>
        <div className="h-64">
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
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Taxa de Compressão por Tipo</h3>
        <div className="h-64">
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
        </div>
      </div>
    </div>
  );
};

export default UploadCharts;
