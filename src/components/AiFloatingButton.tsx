import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X } from 'lucide-react';
import AiChatWindow from './AiChatWindow';

const AiFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AiChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 1 
        }}
        whileHover={{ 
          scale: 1.1,
          rotate: isOpen ? 90 : [0, -10, 10, -10, 0],
          transition: { rotate: { duration: 0.5 } }
        }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="fixed bottom-8 right-8 z-50 group"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse ${
            isOpen ? 'bg-red-500' : 'bg-teal-500'
          }`}></div>
          
          {/* Button */}
          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 transition-colors duration-300 ${
            isOpen 
              ? 'bg-linear-to-tr from-red-500 to-pink-600' 
              : 'bg-linear-to-tr from-teal-500 to-blue-600'
          }`}>
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-8 h-8 text-white relative z-10" />
                </motion.div>
              ) : (
                <motion.div
                  key="bot"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Bot className="w-8 h-8 text-white relative z-10" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Sparkles - only show when closed */}
            {!isOpen && (
              <motion.div 
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                  rotate: [0, 180]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          {/* Tooltip */}
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/90 backdrop-blur text-gray-800 text-sm font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            {isOpen ? 'Close Assistant' : 'Ask AI Assistant'}
          </span>
        </div>
      </motion.button>
    </>
  );
};

export default AiFloatingButton;
