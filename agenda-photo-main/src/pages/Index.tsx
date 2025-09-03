import LandingLayout from "@/layouts/LandingLayout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";

const Index = () => {
  return (
    <LandingLayout>
      {({ onRegisterClick }) => (
        <>
          <Hero onRegisterClick={onRegisterClick} />
          <Features />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTA onRegisterClick={onRegisterClick} />
        </>
      )}
    </LandingLayout>
  );
};

export default Index;
