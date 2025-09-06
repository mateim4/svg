import React from 'react';
import { motion } from 'framer-motion';
import '../styles/design-system.css';
import './NavigationHeader.css';

type AppMode = 'local' | 'github' | 'dashboard';

interface NavigationHeaderProps {
  mode: AppMode;
  title: string;
  onBackToDashboard: () => void;
  onBackToLanding?: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  mode,
  title,
  onBackToDashboard,
  onBackToLanding
}) => {
  if (mode === 'dashboard') {
    return null;
  }

  return (
    <header className="navigation-header">
      <div className="nav-container">
        <motion.button
          className="brand-title clickable-title"
          onClick={onBackToLanding || onBackToDashboard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="brand-name">SVG Designer</span>
        </motion.button>
        
        <h1 className="nav-title">{title}</h1>
      </div>
    </header>
  );
};

export default NavigationHeader;