import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FAQItem } from '@/types/contact';

interface ContactFAQCardProps {
  faqItem: FAQItem;
}

const ContactFAQCard: React.FC<ContactFAQCardProps> = ({ faqItem }) => {
  const { question, answer } = faqItem;

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-8">
        <h3 className="text-xl font-semibold mb-4">{question}</h3>
        <p className="text-slate-600 dark:text-slate-300">
          {answer}
        </p>
      </CardContent>
    </Card>
  );
};

export default ContactFAQCard; 