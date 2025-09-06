import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Github, 
  Zap, 
  Palette, 
  Download,
  Layers,
  Package
} from 'lucide-react';
import './DashboardOverview.css';

type AppMode = 'local' | 'github' | 'iconpacks';
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
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
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
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
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

          {/* Icon Packs Mode */}
          <motion.div 
            className="mode-card iconpacks-mode"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onModeSelect('iconpacks')}
          >
            <div className="card-icon">
              <Package size={32} />
            </div>
            <h3>Browse Icon Packs</h3>
            <p>Explore and customize icons from popular icon libraries</p>
            
            <div className="workflow-steps">
              <div className="step">
                <div className="step-number">1</div>
                <span>Choose icon library</span>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <span>Browse & select icons</span>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <span>Style & download</span>
              </div>
            </div>

            <div className="card-footer">
              <span className="time-estimate">
                <Zap size={14} />
                ~3-5 minutes
              </span>
              <span className="best-for">Best for: Individual icons</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Icon Pack Selection */}
      <motion.div className="iconpack-selection" variants={itemVariants}>
        <h2>Popular Icon Libraries</h2>
        <div className="iconpack-grid">
          {[
            { 
              pack: 'lucide' as IconPack, 
              name: 'Lucide Icons', 
              description: 'Beautiful & consistent SVG icons',
              count: '1,400+',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            { 
              pack: 'heroicons' as IconPack, 
              name: 'Heroicons', 
              description: 'Hand-crafted by Tailwind CSS team',
              count: '300+',
              gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            },
            { 
              pack: 'feather' as IconPack, 
              name: 'Feather', 
              description: 'Simply beautiful open source icons',
              count: '280+',
              gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            },
            { 
              pack: 'phosphor' as IconPack, 
              name: 'Phosphor', 
              description: 'Flexible icon family for interfaces',
              count: '7,000+',
              gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            },
            { 
              pack: 'tabler' as IconPack, 
              name: 'Tabler Icons', 
              description: 'Free MIT-licensed SVG icons',
              count: '5,800+',
              gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            },
            { 
              pack: 'fluent' as IconPack, 
              name: 'Fluent UI', 
              description: 'Microsoft Fluent Design System',
              count: '2,100+',
              gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            }
          ].map(({ pack, name, description, count, gradient }) => (
            <motion.div
              key={pack}
              className="iconpack-card"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onIconPackSelect?.(pack)}
            >
              <div className="iconpack-header" style={{ background: gradient }}>
                <div className="iconpack-count">{count}</div>
              </div>
              <div className="iconpack-content">
                <h4>{name}</h4>
                <p>{description}</p>
                <button className="browse-button">
                  <Package size={16} />
                  Browse Library
                </button>
              </div>
            </motion.div>
          ))}
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