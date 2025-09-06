import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import FluentUIIconDemo from './FluentUIIconDemo';
import './LandingPage.css';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="landing-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Card */}
      <motion.div className="hero-section" variants={itemVariants}>
        <div className="hero-card">
          <div className="hero-icon">
            <Sparkles size={48} />
          </div>
          <h1>SVG Designer</h1>
          <p>Transform SVG icons with beautiful styles like neumorphism, glassmorphism, and more. 
             Perfect for creating consistent icon sets for your design system.</p>
          
          <motion.button
            className="cta-button"
            onClick={onGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
            <ArrowRight size={20} />
          </motion.button>
        </div>

        {/* Single Card with Two Rows */}
        <motion.div className="preview-showcase-card" variants={itemVariants}>
          <FluentUIIconDemo />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;