import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Github, 
  Settings, 
  Zap,
  FileImage,
  Palette,
  Menu,
  X
} from 'lucide-react';
import './Sidebar.css';

type AppMode = 'local' | 'github';

interface SidebarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenuButton: React.FC<MobileMenuProps> = ({ isOpen, onToggle }) => (
  <motion.button
    className="mobile-menu-button"
    onClick={onToggle}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={isOpen ? 'close' : 'menu'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.div>
    </AnimatePresence>
  </motion.button>
);

const Sidebar: React.FC<SidebarProps> = ({ mode, onModeChange }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuItems = [
    {
      id: 'local' as const,
      icon: <Upload size={20} />,
      label: 'Local Files',
      description: 'Upload SVG files from your computer'
    },
    {
      id: 'github' as const,
      icon: <Github size={20} />,
      label: 'GitHub Repo',
      description: 'Browse icons from GitHub repositories'
    }
  ];

  const tools = [
    {
      icon: <Palette size={18} />,
      label: 'Style Controls',
      description: 'Customize icon appearance'
    },
    {
      icon: <Zap size={18} />,
      label: 'Batch Process',
      description: 'Process multiple icons'
    },
    {
      icon: <FileImage size={18} />,
      label: 'Preview & Export',
      description: 'View and download results'
    }
  ];

  const handleModeChange = (newMode: AppMode) => {
    onModeChange(newMode);
    setIsMobileOpen(false); // Close mobile menu when mode changes
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton 
        isOpen={isMobileOpen} 
        onToggle={() => setIsMobileOpen(!isMobileOpen)} 
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      <div className="sidebar-header">
        <div className="app-logo">
          <div className="logo-icon">
            <Settings size={24} />
          </div>
          <div className="logo-text">
            <h1>SVG Designer</h1>
            <p>Create beautiful styled icons</p>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="menu-section">
          <h3 className="section-title">Source</h3>
          <div className="menu-items">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                className={`menu-item ${mode === item.id ? 'active' : ''}`}
                onClick={() => handleModeChange(item.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="item-icon">{item.icon}</div>
                <div className="item-content">
                  <div className="item-label">{item.label}</div>
                  <div className="item-description">{item.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="tools-section">
          <h3 className="section-title">Tools</h3>
          <div className="tool-items">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                className="tool-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="tool-icon">{tool.icon}</div>
                <div className="tool-content">
                  <div className="tool-label">{tool.label}</div>
                  <div className="tool-description">{tool.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default Sidebar;