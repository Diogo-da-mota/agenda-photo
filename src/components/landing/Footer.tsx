import React from 'react';
import Logo from '@/components/Logo';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
      <ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="col-span-1 flex flex-col items-start order-1">
            <Logo />
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://facebook.com" 
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-gradient-to-br from-purple-600 to-pink-600 hover:text-white transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-400 hover:text-white transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={20} />
              </a>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-base">
              Plataforma completa <br /> para gerenciar sua <br /> fotografia profissional.
            </p>
          </div>
          
          <div className="order-3 md:order-2 text-center md:text-left">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Produto</h3>
            <ul className="space-y-4">
              <li><Link to="/funcionalidades" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Funcionalidades</Link></li>
              <li><a href="/#pricing" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Preços</a></li>
              <li><a href="/#testimonials" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Depoimentos</a></li>
              <li><a href="/#faq" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div className="order-4 md:order-3 text-center md:text-left">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Empresa</h3>
            <ul className="space-y-4">
              <li><Link to="/sobre-nos" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sobre Nós</Link></li>
              <li><Link to="/blog" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link to="/carreiras" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Carreiras</Link></li>
              <li><Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contato</Link></li>
            </ul>
          </div>
          
          <div className="order-2 md:order-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/cookies" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Política de Cookies</Link></li>
              <li><Link to="/lgpd" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">LGPD</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            &copy; {currentYear} AgendaPro. Todos os direitos reservados.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://wa.me/55 (00)0 0000-0000" className="text-slate-500 dark:text-slate-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Suporte via WhatsApp
            </a>
            <a href="mailto:contato@agendapro.com" className="text-slate-500 dark:text-slate-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              contato@agendapro.com
            </a>
          </div>
        </div>
      </ResponsiveContainer>
    </footer>
  );
};

export default Footer;
