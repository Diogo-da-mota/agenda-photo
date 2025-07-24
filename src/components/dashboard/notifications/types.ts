
export interface Notification {
  id: number;
  type: 'event' | 'payment' | 'reminder' | 'system' | 'birthday' | 'dasmei';
  title: string;
  description: string;
  date: Date;
  read: boolean;
  link?: string;
  linkText?: string;
}
