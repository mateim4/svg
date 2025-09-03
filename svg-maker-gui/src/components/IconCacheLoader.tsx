import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Database,
  Zap,
  Clock
} from 'lucide-react';
import { iconCacheService } from '../services/iconCacheService';
import './IconCacheLoader.css';

interface PreloadProgress {
  repository: string;
  progress: number;
  loaded: number;
  total: number;
  isComplete: boolean;
}

interface IconCacheLoaderProps {
  autoStart?: boolean;
  showProgress?: boolean;
  onComplete?: () => void;
}

const IconCacheLoader: React.FC<IconCacheLoaderProps> = ({
  autoStart = true,
  showProgress = true,
  onComplete
}) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(new Map<string, PreloadProgress>());
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState(iconCacheService.getCacheStats());

  useEffect(() => {
    if (autoStart) {
      startPreloading();
    }
  }, [autoStart]);

  useEffect(() => {
    // Update cache stats periodically
    const interval = setInterval(() => {
      setCacheStats(iconCacheService.getCacheStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const startPreloading = async () => {
    if (isPreloading) return;

    setIsPreloading(true);
    setError(null);
    setIsComplete(false);

    try {
      await iconCacheService.preloadBuiltInRepositories((progressUpdate) => {
        setProgress(prev => {
          const updated = new Map(prev);
          updated.set(progressUpdate.repository, progressUpdate);
          return updated;
        });
      });

      setIsComplete(true);
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload icon cache');
    } finally {
      setIsPreloading(false);
    }
  };

  const getTotalProgress = (): number => {
    const progressValues = Array.from(progress.values());
    if (progressValues.length === 0) return 0;
    
    const totalProgress = progressValues.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(totalProgress / progressValues.length);
  };

  const getTotalIcons = (): { loaded: number; total: number } => {
    const progressValues = Array.from(progress.values());
    return progressValues.reduce(
      (acc, p) => ({
        loaded: acc.loaded + p.loaded,
        total: acc.total + p.total
      }),
      { loaded: 0, total: 0 }
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!showProgress) {
    return null;
  }

  return (
    <AnimatePresence>
      {(isPreloading || showDetails) && (
        <motion.div
          className="cache-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="cache-loader-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="cache-loader-header">
              <div className="header-content">
                <div className="header-icon">
                  {isComplete ? (
                    <CheckCircle2 size={24} className="success-icon" />
                  ) : error ? (
                    <AlertCircle size={24} className="error-icon" />
                  ) : (
                    <Download size={24} className="loading-icon" />
                  )}
                </div>
                <div className="header-text">
                  <h3>
                    {isComplete 
                      ? 'Icon Cache Complete!' 
                      : error 
                        ? 'Cache Error' 
                        : 'Pre-loading Icon Previews'
                    }
                  </h3>
                  <p>
                    {isComplete
                      ? 'All icon previews have been cached for instant loading'
                      : error
                        ? error
                        : 'Downloading and caching SVG icons for better performance...'
                    }
                  </p>
                </div>
              </div>
              
              {!isPreloading && (
                <button
                  onClick={() => setShowDetails(false)}
                  className="close-button"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Overall Progress */}
            {isPreloading && (
              <div className="overall-progress">
                <div className="progress-stats">
                  <span className="progress-text">
                    {getTotalProgress()}% Complete
                  </span>
                  <span className="icons-count">
                    {getTotalIcons().loaded} / {getTotalIcons().total} icons
                  </span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${getTotalProgress()}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Repository Progress Details */}
            <div className="repositories-progress">
              {Array.from(progress.entries()).map(([repoId, repoProgress]) => (
                <motion.div
                  key={repoId}
                  className={`repo-progress ${repoProgress.isComplete ? 'complete' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="repo-header">
                    <div className="repo-info">
                      <span className="repo-name">{repoProgress.repository}</span>
                      <span className="repo-stats">
                        {repoProgress.loaded} / {repoProgress.total}
                      </span>
                    </div>
                    <div className="repo-status">
                      {repoProgress.isComplete ? (
                        <CheckCircle2 size={16} className="success-icon" />
                      ) : (
                        <span className="progress-percent">{repoProgress.progress}%</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="repo-progress-bar">
                    <motion.div
                      className="repo-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${repoProgress.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cache Statistics */}
            <div className="cache-stats">
              <div className="stat-item">
                <Database size={16} />
                <span>Cached Icons: {cacheStats.cachedIcons}</span>
              </div>
              <div className="stat-item">
                <Zap size={16} />
                <span>Cache Size: {formatFileSize(cacheStats.totalCacheSize)}</span>
              </div>
              <div className="stat-item">
                <Clock size={16} />
                <span>Status: {isComplete ? 'Ready' : isPreloading ? 'Loading...' : 'Idle'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="cache-loader-actions">
              {!isPreloading && !isComplete && (
                <button onClick={startPreloading} className="action-btn primary">
                  Start Pre-loading
                </button>
              )}
              
              {isComplete && (
                <button 
                  onClick={() => setShowDetails(false)} 
                  className="action-btn secondary"
                >
                  Continue
                </button>
              )}
              
              {error && (
                <button onClick={startPreloading} className="action-btn primary">
                  Retry
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Compact version for showing in header or status bar
export const IconCacheStatus: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [cacheStats, setCacheStats] = useState(iconCacheService.getCacheStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(iconCacheService.getCacheStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="cache-status-compact"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Database size={16} />
      <span>{cacheStats.cachedIcons} cached</span>
    </motion.div>
  );
};

export default IconCacheLoader;