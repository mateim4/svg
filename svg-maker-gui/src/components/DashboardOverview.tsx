import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Github, 
  Zap, 
  Palette, 
  Download,
  Layers
} from 'lucide-react';
import './DashboardOverview.css';

type AppMode = 'local' | 'github';
type IconPack = 'lucide' | 'heroicons' | 'feather' | 'phosphor' | 'tabler' | 'fluent';

interface DashboardOverviewProps {
  onModeSelect: (mode: AppMode) => void;
  onIconPackSelect?: (iconPack: IconPack) => void;
  onGetStarted: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onModeSelect, 
  onIconPackSelect,
  onGetStarted 
}) => {
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
      className="dashboard-overview"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      {/* Mode Selection Cards */}
      <motion.div className="mode-selection" variants={itemVariants}>
        <h2>Choose Your Workflow</h2>
        <div className="mode-cards">
          
          {/* Local Files Mode */}
          <motion.div 
            className="mode-card local-mode"
            onClick={() => onModeSelect('local')}
          >
            <div className="card-icon">
              <Upload size={32} />
            </div>
            <h3>Local Files</h3>
            <p>Upload SVG files from your computer for quick processing</p>
            
            <div className="workflow-steps">
              <div className="step">
                <div className="step-number">1</div>
                <span>Upload SVG files</span>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <span>Choose style preset</span>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <span>Customize & download</span>
              </div>
            </div>

            <div className="card-footer">
              <span className="time-estimate">
                <Zap size={14} />
                ~2 minutes
              </span>
              <span className="best-for">Best for: Quick projects</span>
            </div>
          </motion.div>

          {/* GitHub Mode */}
          <motion.div 
            className="mode-card github-mode"
            onClick={() => onModeSelect('github')}
          >
            <div className="card-icon">
              <Github size={32} />
            </div>
            <h3>GitHub Repository</h3>
            <p>Import and process entire icon libraries from GitHub</p>
            
            <div className="workflow-steps">
              <div className="step">
                <div className="step-number">1</div>
                <span>Enter GitHub URL</span>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <span>Select icons to process</span>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <span>Batch process & export</span>
              </div>
            </div>

            <div className="card-footer">
              <span className="time-estimate">
                <Zap size={14} />
                ~5-10 minutes
              </span>
              <span className="best-for">Best for: Large icon sets</span>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Features Highlight */}
      <motion.div className="features-section" variants={itemVariants}>
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <Palette size={24} />
            <h4>Style Presets</h4>
            <p>Neumorphism, glassmorphism, flat design, and FluentUI styles</p>
          </div>
          <div className="feature-item">
            <Layers size={24} />
            <h4>Batch Processing</h4>
            <p>Process hundreds of icons simultaneously with consistent styling</p>
          </div>
          <div className="feature-item">
            <Download size={24} />
            <h4>Easy Export</h4>
            <p>Download individual files or complete ZIP archives</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview;