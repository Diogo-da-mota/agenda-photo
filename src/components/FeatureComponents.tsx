
import React from 'react';

// Interface for FeatureSection props
export interface FeatureSectionProps {
  icon: React.ReactNode;
  title: string;
  features: string[];
}

// Interface for FeatureCard props
export interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
}

// Component for feature sections
export const FeatureSection = ({ icon, title, features }: FeatureSectionProps) => (
  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h3 className="font-medium text-lg">{title}</h3>
    </div>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0 mt-0.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Component for feature cards
export const FeatureCard = ({ icon, color, title, description }: FeatureCardProps) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col items-center text-center">
    <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);
