import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Package,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight
} from 'lucide-react';
import iconRepositoryService, { RepositorySource } from '../services/iconRepositoryService';
import '../styles/design-system.css';
import './IconRepositoryBrowser.css';
import './IconRepositoryBrowser-responsive-fixes.css';
import { useDebouncedSearch } from '../hooks/useDebounce';

interface IconRepositoryBrowserProps {
  onRepositorySelect: (repository: RepositorySource) => void;
}

const IconRepositoryBrowser: React.FC<IconRepositoryBrowserProps> = ({
  onRepositorySelect
}) => {
  const [repositories, setRepositories] = useState<RepositorySource[]>([]);
  const [loading, setLoading] = useState(true);
  const { displayValue: searchQuery, searchValue: debouncedSearchQuery, setDisplayValue: setSearchQuery } = useDebouncedSearch('', 300);
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

  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      // Category filter first (most selective)
      const matchesCategory = selectedCategory === 'all' || 
                             selectedCategory === repo.type ||
                             repo.repository.categories.includes(selectedCategory);
      
      if (!matchesCategory) return false;

      // Skip search if no search query
      if (!debouncedSearchQuery.trim()) return true;

      // Optimized search
      const query = debouncedSearchQuery.toLowerCase();
      const matchesSearch = repo.repository.name.toLowerCase().includes(query) ||
                           repo.repository.description.toLowerCase().includes(query);
      
      return matchesSearch;
    });
  }, [repositories, debouncedSearchQuery, selectedCategory]);

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
      {/* Combined Icon Packs Overview Card */}
      <motion.div 
        className="repository-overview-card github-repo-style"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="overview-header">
          <div className="header-icon">
            <Package size={24} />
          </div>
          <div>
            <h3>Icon Repositories</h3>
            <p>Choose from pre-installed collections or add external repositories</p>
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

        <div className="overview-stats">
          <div className="stat-highlight">
            <span className="stat-number">{repositories.reduce((sum, r) => sum + r.repository.iconCount, 0).toLocaleString()}</span>
            <span className="stat-label">Total Icons</span>
          </div>
          <div className="stat-highlight">
            <span className="stat-number">{repositories.filter(r => r.type === 'local').length}</span>
            <span className="stat-label">Icon Libraries</span>
          </div>
          <div className="stat-highlight">
            <span className="stat-number">9</span>
            <span className="stat-label">Different Styles</span>
          </div>
        </div>
      </motion.div>

      {/* Individual Repository Cards Grid */}
      <div className={`overview-repositories ${viewMode}`}>
        <AnimatePresence>
          {filteredRepositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              className={`repository-card-outline ${repo.type}`}
              data-repository-id={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleRepositorySelect(repo)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >

              {/* Card Header */}
              <div className="repository-header">
                <h3 className="repository-name">{repo.repository.name}</h3>
                <div className="repository-meta">
                  <div className="meta-item">
                    <Star size={12} />
                    <span>{repo.repository.iconCount.toLocaleString()} icons</span>
                  </div>
                  <div className="meta-item">
                    <span className="license-badge">{repo.repository.license}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="repository-body">
                {/* Developer/Company */}
                <div className="repository-info-item">
                  <span className="info-label">Developer:</span>
                  <span className="info-value">{repo.repository.developer}</span>
                </div>
                
                {/* Pack Size */}
                <div className="repository-info-item">
                  <span className="info-label">Pack Size:</span>
                  <span className="info-value">{repo.repository.packSize}</span>
                </div>
                
                {/* Use Case Tags */}
                <div className="repository-info-item">
                  <span className="info-label">Use Cases:</span>
                  <div className="repository-tags">
                    {repo.repository.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Art Direction */}
                <div className="repository-info-item art-direction">
                  <span className="info-label">Art Direction:</span>
                  <p className="art-direction-text">{repo.repository.artDirection}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="repository-footer">
                {repo.type === 'local' ? (
                  <button 
                    className="ds-button ds-button-primary action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRepositorySelect(repo);
                    }}
                  >
                    <Package size={16} />
                    Browse Icons
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button 
                    className="ds-button ds-button-secondary action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRepositorySelect(repo);
                    }}
                  >
                    <Package size={16} />
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

    </div>
  );
};

export default IconRepositoryBrowser;