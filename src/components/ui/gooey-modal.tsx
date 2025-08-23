import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GooeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const GooeyModal: React.FC<GooeyModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent
}) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Debug logs temporários
  console.log('[DEBUG] GooeyModal renderizado:', { isOpen, isMounted, title });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal Container - clickable area should not close modal */}
            <motion.div
              className="relative max-w-md w-full mx-4"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                opacity: 1,
                transition: { 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  duration: 0.4 
                }
              }}
              exit={{ 
                scale: 0.9, 
                y: 20, 
                opacity: 0,
                transition: { duration: 0.3 } 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gooey Background with blur */}
              <div className="absolute inset-0 bg-white dark:bg-[#111827] rounded-2xl overflow-hidden">
                <div className="absolute -inset-[100px] flex justify-center items-center opacity-60">
                  <div className="absolute w-72 h-72 bg-blue-600 rounded-full filter blur-3xl" 
                       style={{ top: '-10%', left: '10%', animation: 'float 8s ease-in-out infinite' }} />
                  <div className="absolute w-72 h-72 bg-indigo-700 rounded-full filter blur-3xl" 
                       style={{ bottom: '-20%', right: '5%', animation: 'float 10s ease-in-out infinite reverse' }} />
                </div>
                <div className="absolute inset-0 backdrop-blur-xl" />
              </div>

              {/* Content Container */}
              <div className="relative bg-white/90 dark:bg-[#111827]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {children}
                </div>

                {/* Footer if provided */}
                {footerContent && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                    {footerContent}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};