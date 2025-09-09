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
    <motion.main 
      className="landing-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="main"
      aria-label="SVG Designer landing page"
    >
      {/* Hero Section */}
      <motion.section className="hero-section" variants={itemVariants} aria-labelledby="hero-heading">
        <header className="hero-card">
          <div className="hero-icon" aria-hidden="true">
            <Sparkles size={48} />
          </div>
          <h1 id="hero-heading">SVG Designer</h1>
          <p>Transform SVG icons with beautiful styles like neumorphism, glassmorphism, and more. 
             Perfect for creating consistent icon sets for your design system.</p>
          
          <motion.button
            className="cta-button"
            onClick={onGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Get started with SVG Designer - Begin creating styled icons"
            type="button"
          >
            Get Started
            <ArrowRight size={20} aria-hidden="true" />
          </motion.button>
        </header>

        {/* Preview Section */}
        <motion.section className="preview-showcase-card" variants={itemVariants} aria-labelledby="preview-heading">
          <h2 id="preview-heading" className="sr-only">Icon Style Preview</h2>
          <FluentUIIconDemo />
        </motion.section>
      </motion.section>
    </motion.main>
  );
};

export default LandingPage;