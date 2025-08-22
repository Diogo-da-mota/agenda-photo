import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionGroupCardProps {
  title: string;
  transactions: any[];
}

export const TransactionGroupCard: React.FC<TransactionGroupCardProps> = ({ title, transactions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{transactions.length} transações</p>
      </CardContent>
    </Card>
  );
};

export default TransactionGroupCard;