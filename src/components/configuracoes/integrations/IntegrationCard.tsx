
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface IntegrationCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <Card className="border-gray-700/50 bg-gray-850/40">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <CardTitle className="text-xl text-white">{title}</CardTitle>
            <CardDescription className="text-gray-300">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
