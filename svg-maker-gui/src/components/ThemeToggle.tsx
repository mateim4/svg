import React, { useEffect, useState } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSettings = () => {
    // TODO: Implement settings modal
    console.log('Settings clicked');
  };

  return (
    <div className="theme-controls-container">
      <div className="theme-controls">
        <button
          onClick={handleSettings}
          className="control-button settings-btn"
          title="Settings"
          aria-label="Open settings"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={toggleTheme}
          className="control-button theme-btn"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;