import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { API_ORIGIN, useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  ClockIcon, 
  BookmarkIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  BellIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: ChartBarIcon },
    { name: t('research'), path: '/research', icon: MagnifyingGlassIcon },
    { name: t('history'), path: '/history', icon: ClockIcon },
    { name: t('savedReports'), path: '/saved-reports', icon: DocumentTextIcon },
    { name: t('bookmarks'), path: '/watchlist', icon: BookmarkIcon },
    { name: t('profile'), path: '/profile', icon: UserIcon },
    { name: t('settings'), path: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 76 : 238 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 h-screen bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-900 flex flex-col justify-between p-3.5 z-40 shadow-none"
    >
      {/* Upper Logo Section */}
      <div>
        <div className="flex items-center justify-between mb-7 px-1.5 pt-1">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-[17px] font-display font-extrabold text-slate-900 dark:text-white cursor-pointer"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-blue-700 text-xs text-white shadow-lg shadow-brand-500/20">IQ</span>
              <span>Invest<span className="text-brand-600">IQ</span></span>
            </motion.div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg text-slate-500 dark:text-slate-400"
          >
            {collapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[13px] transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Actions & Toggle Theme */}
      <div className="space-y-4">
        {/* Theme switcher */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded-xl text-slate-500 dark:text-slate-400"
        >
          {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </motion.span>
          )}
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 p-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
            <img 
              src={user.avatar_url?.startsWith('/') ? `${API_ORIGIN}${user.avatar_url}` : user.avatar_url} 
              alt="avatar" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30"
            />
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-grow min-w-0"
              >
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user.username}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </motion.div>
            )}
            {!collapsed && (
              <button 
                onClick={logout}
                className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                title={t('logout')}
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;




