
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Cake,
  FileText
} from 'lucide-react';

interface NotificationStatsProps {
  total: number;
  unread: number;
  eventCount: number;
  paymentCount: number;
  systemCount: number;
  birthdayCount: number;
  dasmeiCount: number;
}

const NotificationStats: React.FC<NotificationStatsProps> = ({
  total,
  unread,
  eventCount,
  paymentCount,
  systemCount,
  birthdayCount,
  dasmeiCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <h4 className="text-2xl font-bold mt-1">{total}</h4>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {unread} não lidas
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Eventos</p>
              <h4 className="text-2xl font-bold mt-1">{eventCount}</h4>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Pagamentos</p>
              <h4 className="text-2xl font-bold mt-1">{paymentCount}</h4>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Sistema</p>
              <h4 className="text-2xl font-bold mt-1">{systemCount}</h4>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationStats;
