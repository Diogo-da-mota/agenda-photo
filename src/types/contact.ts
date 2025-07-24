export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactInfo {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  value: string;
  href?: string;
  bgColor: string;
}

export interface FAQItem {
  question: string;
  answer: string;
} 