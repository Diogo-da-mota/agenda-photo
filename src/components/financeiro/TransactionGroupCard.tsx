import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionGroupCardProps {
  title?: string;
  transactions?: any[];
  group?: any;
  onEditTransaction?: (data: any) => void;
  formatarMoeda?: (valor: number) => string;
  formatDate?: (date: Date) => string;
}

export const TransactionGroupCard: React.FC<TransactionGroupCardProps> = ({ 
  group, 
  title = group?.title, 
  transactions = group?.transactions || [], 
  onEditTransaction, 
  formatarMoeda, 
  formatDate 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Transações'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{transactions.length} transações</p>
      </CardContent>
    </Card>
  );
};

export default TransactionGroupCard;