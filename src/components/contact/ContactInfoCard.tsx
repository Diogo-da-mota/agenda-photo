import React from 'react';
import { ContactInfo } from '@/types/contact';

interface ContactInfoCardProps {
  info: ContactInfo;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ info }) => {
  const { icon: Icon, title, description, value, href, bgColor } = info;
  
  const renderValue = () => {
    if (title === 'Horário de Atendimento') {
      return (
        <div className="text-slate-600 dark:text-slate-300 space-y-1">
          {value.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      );
    }
    
    if (href) {
      return (
        <a 
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`hover:underline font-medium ${
            title === 'WhatsApp' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}
        >
          {value}
        </a>
      );
    }
    
    return <span className="text-slate-600 dark:text-slate-300">{value}</span>;
  };

  return (
    <div className="flex items-start gap-4">
      {/* Ícone */}
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      {/* Conteúdo */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-slate-600 dark:text-slate-300 mb-1">
            {description}
          </p>
        )}
        {renderValue()}
      </div>
    </div>
  );
};

export default ContactInfoCard; 