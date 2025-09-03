import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import '../styles/design-system.css';
import './NavigationHeader.css';

type AppMode = 'local' | 'github' | 'dashboard';

interface NavigationHeaderProps {
  mode: AppMode;
  title: string;
  onBackToDashboard: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  mode,
  title,
  onBackToDashboard
}) => {
  if (mode === 'dashboard') {
    return null;
  }

  return (
    <header className="navigation-header">
      <div className="nav-container">
        <motion.button
          className="back-button ds-button ds-button-ghost"
          onClick={onBackToDashboard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </motion.button>
        
        <h1 className="nav-title">{title}</h1>
      </div>
    </header>
  );
};

export default NavigationHeader;