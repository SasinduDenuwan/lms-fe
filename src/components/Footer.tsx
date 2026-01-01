import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-20 relative z-10 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Logo and Description */}
          <div className="text-center md:text-left md:w-1/3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center md:justify-start space-x-3 mb-6"
            >
              <div className="w-10 h-10 bg-linear-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">NE</span>
              </div>
              <span className="text-2xl font-bold">NovaEdu</span>
            </motion.div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Empowering learners with expert-led courses. Unlock your potential today.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-lg font-medium text-gray-400">
            {['Home', 'Courses', 'About', 'Contact', 'Support'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                whileHover={{ color: '#14B8A6', y: -2 }}
                className="hover:text-teal-400 transition-all duration-300"
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-base">
            &copy; {new Date().getFullYear()} NovaEdu. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
