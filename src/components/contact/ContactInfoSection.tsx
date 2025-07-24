import React from 'react';
import ContactInfoCard from './ContactInfoCard';
import { CONTACT_INFO } from '@/constants/contact';

const ContactInfoSection: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold mb-8">
        Como podemos{' '}
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ajudar?
        </span>
      </h2>
      
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
        Nossa equipe está pronta para responder suas dúvidas, ouvir suas sugestões 
        e ajudar você a aproveitar ao máximo a AgendaPRO.
      </p>
      
      <div className="space-y-8">
        {CONTACT_INFO.map((info, index) => (
          <ContactInfoCard key={index} info={info} />
        ))}
      </div>
    </div>
  );
};

export default ContactInfoSection; 