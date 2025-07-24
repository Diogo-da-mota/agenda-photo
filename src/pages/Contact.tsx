import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import {
  ContactHero,
  ContactInfoSection,
  ContactForm,
  ContactFAQSection
} from "@/components/contact";

const Contact: React.FC = () => {

  return (
    <LandingLayout>
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30">
        
        {/* Hero Section */}
        <ContactHero />

        {/* Conteúdo Principal */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="max-w-6xl mx-auto">
              
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Informações de Contato */}
                <ContactInfoSection />
                
                {/* Formulário de Contato */}
                <ContactForm />
              </div>
              
              {/* FAQ Rápido */}
              <ContactFAQSection />
              
            </div>
          </ResponsiveContainer>
        </section>

      </div>
    </LandingLayout>
  );
};

export default Contact; 