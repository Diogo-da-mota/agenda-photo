import React from 'react';
import ContactFAQCard from './ContactFAQCard';
import { FAQ_ITEMS } from '@/constants/contact';

const ContactFAQSection: React.FC = () => {
  return (
    <div className="mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Perguntas{' '}
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Frequentes
        </span>
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {FAQ_ITEMS.map((faqItem, index) => (
          <ContactFAQCard key={index} faqItem={faqItem} />
        ))}
      </div>
    </div>
  );
};

export default ContactFAQSection; 