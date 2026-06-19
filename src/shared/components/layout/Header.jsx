import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ onMenuOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Compute Page Title based on pathname
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Summary';
      case '/categories':
        return 'Category Management';
      case '/products':
        return 'Product Inventory';
      case '/orders':
        return 'WhatsApp Customer Orders';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-[#13132e] border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-6 lg:px-8">
      {/* Left side: Hamburger menu for small screens & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: Actions & User context */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/85 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-200"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1a1a3e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block leading-none">Super Administrator</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">{user?.email || 'admin@grocery.com'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
