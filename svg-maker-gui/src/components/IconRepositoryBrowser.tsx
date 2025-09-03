import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive,
  Download,
  Github,
  Star,
  Clock,
  Package,
  Zap,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';
import iconRepositoryService, { RepositorySource } from '../services/iconRepositoryService';
import '../styles/design-system.css';
import './IconRepositoryBrowser.css';

interface IconRepositoryBrowserProps {
  onRepositorySelect: (repository: RepositorySource) => void;
}

const IconRepositoryBrowser: React.FC<IconRepositoryBrowserProps> = ({
  onRepositorySelect
}) => {
  const [repositories, setRepositories] = useState<RepositorySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      const repos = await iconRepositoryService.getAvailableRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.repository.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.repository.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === repo.type ||
                           repo.repository.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'all',
    'local',
    'external',
    ...Array.from(new Set(repositories.flatMap(r => r.repository.categories)))
  ];

  const handleRepositorySelect = (repository: RepositorySource) => {
    onRepositorySelect(repository);
  };

  if (loading) {
    return (
      <div className="repository-browser ds-card">
        <div className="loading-state">
          <div className="ds-spinner" />
          <p>Loading icon repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="repository-browser ds-card">
      {/* Header */}
      <div className="ds-section-header">
        <div className="ds-section-icon">
          <Package size={24} />
        </div>
        <div>
          <h2 className="ds-section-title">Icon Repositories</h2>
          <p className="repository-subtitle">
            Choose from pre-installed collections or add external repositories
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="repository-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ds-input"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ds-input category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : 
                 category === 'local' ? '📦 Local' :
                 category === 'external' ? '🌐 External' :
                 category}
              </option>
            ))}
          </select>
        </div>

        <div className="view-controls">
          <button
            className={`ds-button ${viewMode === 'grid' ? 'ds-button-primary' : 'ds-button-ghost'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </button>
          <button
            className={`ds-button ${viewMode === 'list' ? 'ds-button-primary' : 'ds-button-ghost'}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Repository Grid/List */}
      <div className={`repository-container ${viewMode}`}>
        <AnimatePresence>
          {filteredRepositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              className={`repository-card ${repo.type}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleRepositorySelect(repo)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Repository Type Badge */}
              <div className="repository-badge">
                {repo.type === 'local' ? (
                  <div className="local-badge">
                    <HardDrive size={14} />
                    <span>Local</span>
                  </div>
                ) : (
                  <div className="external-badge">
                    <Github size={14} />
                    <span>External</span>
                  </div>
                )}
              </div>

              {/* Connection Status */}
              <div className="connection-status">
                {repo.isAvailableOffline ? (
                  <div className="offline-available" title="Available offline">
                    <Zap size={14} />
                  </div>
                ) : (
                  <div className="online-required" title="Requires internet connection">
                    <Wifi size={14} />
                  </div>
                )}
              </div>

              {/* Repository Info */}
              <div className="repository-info">
                <h3 className="repository-name">{repo.repository.name}</h3>
                <p className="repository-description">{repo.repository.description}</p>

                <div className="repository-meta">
                  <div className="meta-item">
                    <Star size={12} />
                    <span>{repo.repository.iconCount.toLocaleString()} icons</span>
                  </div>
                  
                  {repo.downloadSize && (
                    <div className="meta-item">
                      <Download size={12} />
                      <span>{repo.downloadSize}</span>
                    </div>
                  )}

                  <div className="meta-item">
                    <span className="license-badge">{repo.repository.license}</span>
                  </div>
                </div>

                <div className="repository-tags">
                  {repo.repository.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview Icons */}
              <div className="repository-preview">
                <div className="preview-icons">
                  {repo.repository.preview.slice(0, 4).map((iconName, i) => (
                    <div key={iconName} className="preview-icon">
                      {/* Simple geometric shapes as preview */}
                      <div className="icon-placeholder" style={{ 
                        background: `hsl(${i * 90}, 60%, 70%)`,
                        borderRadius: i % 2 === 0 ? '50%' : '20%'
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="repository-action">
                {repo.type === 'local' ? (
                  <button className="ds-button ds-button-primary action-button">
                    <Zap size={16} />
                    Browse Icons
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className="ds-button ds-button-secondary action-button">
                    <Download size={16} />
                    Load Repository
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRepositories.length === 0 && (
        <div className="empty-state">
          <Filter size={48} />
          <h3>No repositories found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="repository-stats">
        <div className="stat-item">
          <HardDrive size={16} />
          <span>{repositories.filter(r => r.type === 'local').length} Local</span>
        </div>
        <div className="stat-item">
          <Github size={16} />
          <span>{repositories.filter(r => r.type === 'external').length} External</span>
        </div>
        <div className="stat-item">
          <Star size={16} />
          <span>{repositories.reduce((sum, r) => sum + r.repository.iconCount, 0).toLocaleString()} Total Icons</span>
        </div>
      </div>
    </div>
  );
};

export default IconRepositoryBrowser;