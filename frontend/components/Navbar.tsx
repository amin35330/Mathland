
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme, isAuthenticated, settings } = useAppContext();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'خانه' },
    { to: '/books', label: 'کتاب‌ها' },
    { to: '/teachers', label: 'معلمین' },
    { to: '/videos', label: 'ویدیوها' },
    { to: '/paradox', label: 'عجایب ریاضی' },
    { to: '/about', label: 'درباره ما' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link to="/admin" className="flex items-center gap-2 group" title="ورود به پنل مدیریت">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-lg text-white transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary-500/30 relative overflow-hidden">
                {settings.appLogoUrl ? (
                  <img src={settings.appLogoUrl} alt="Logo" className="w-6 h-6 object-cover" />
                ) : (
                  <GraduationCap size={24} />
                )}
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-l from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-300">
                {settings.appName}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive(link.to)
                    ? 'text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated && (
              <Link to="/admin" className="mr-2 text-accent-600 dark:text-accent-400 hover:text-accent-700 font-bold text-sm flex items-center gap-1 px-3 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
                <ShieldCheck size={16} />
                <span>پنل مدیریت</span>
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 dark:bg-gray-800"
              aria-label="Toggle Theme"
            >
              {theme.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.to)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-gray-800"
              >
                پنل مدیریت
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
