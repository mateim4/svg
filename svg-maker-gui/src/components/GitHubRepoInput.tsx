import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Download, Folder, Search, AlertCircle } from 'lucide-react';
import './GitHubRepoInput.css';

interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
}

interface GitHubRepoInputProps {
  onRepoLoad: (repoInfo: RepoInfo) => void;
  isLoading: boolean;
}

const GitHubRepoInput: React.FC<GitHubRepoInputProps> = ({ onRepoLoad, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');

  const parseGitHubUrl = (url: string): RepoInfo | null => {
    // Match patterns like:
    // https://github.com/owner/repo
    // https://github.com/owner/repo/tree/branch
    // github.com/owner/repo
    // owner/repo
    
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
      /^([^\/\s]+)\/([^\/\s]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, ''), // Remove .git suffix if present
          branch: match[3] || 'main' // Default to main branch
        };
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    const repoInfo = parseGitHubUrl(repoUrl.trim());
    if (!repoInfo) {
      setError('Invalid GitHub URL format. Use: github.com/owner/repo or owner/repo');
      return;
    }

    onRepoLoad(repoInfo);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value);
    if (error) setError(''); // Clear error on typing
  };

  return (
    <div className="github-repo-input">
      <motion.div
        className="repo-input-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-icon">
          <Github size={24} />
        </div>
        <div>
          <h3>GitHub Repository</h3>
          <p>Load SVG icons from a GitHub repository</p>
        </div>
      </motion.div>

      <motion.form
        className="repo-input-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              value={repoUrl}
              onChange={handleInputChange}
              placeholder="e.g., microsoft/fluentui-system-icons or https://github.com/owner/repo"
              className={error ? 'error' : ''}
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={isLoading || !repoUrl.trim()}
              className="load-button"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Loading...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Load Repository
                </>
              )}
            </motion.button>
          </div>
          
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle size={16} />
              <div>
                <div>{error}</div>
                {error.includes('rate limit') && (
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
                    💡 Tip: Try again in a few minutes, or use authenticated requests for higher limits.
                  </div>
                )}
                {error.includes('Access denied') && (
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
                    💡 Tip: Make sure the repository is public, or try these alternatives: heroicons/heroicons, lucide-icons/lucide
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="repo-examples">
          <h4>Examples:</h4>
          <div className="example-links">
            {[
              { name: 'Fluent System Icons', url: 'microsoft/fluentui-system-icons' },
              { name: 'Heroicons', url: 'heroicons/heroicons' },
              { name: 'Lucide Icons', url: 'lucide-icons/lucide' },
              { name: 'Tabler Icons', url: 'tabler/tabler-icons' },
            ].map((example) => (
              <motion.button
                key={example.name}
                type="button"
                className="example-link"
                onClick={() => setRepoUrl(example.url)}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Folder size={16} />
                {example.name}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.form>

      <motion.div
        className="repo-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="info-item">
          <Download size={18} />
          <span>Supports public GitHub repositories</span>
        </div>
        <div className="info-item">
          <Folder size={18} />
          <span>Preserves original folder structure</span>
        </div>
        <div className="info-item">
          <Search size={18} />
          <span>Automatically finds all SVG files</span>
        </div>
      </motion.div>
    </div>
  );
};

export default GitHubRepoInput;