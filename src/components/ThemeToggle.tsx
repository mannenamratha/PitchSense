import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark theme
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('pitchsense-theme') as Theme || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('pitchsense-theme', newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return Moon;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Toggle theme"
      >
        <ThemeIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <button
            onClick={() => handleThemeChange('light')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 ${
              theme === 'light' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          
          <button
            onClick={() => handleThemeChange('dark')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 ${
              theme === 'dark' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
          
          <button
            onClick={() => handleThemeChange('system')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 ${
              theme === 'system' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;