import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { API_ORIGIN, useAuth, api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BellIcon, GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MainLayout = () => {
  const { user } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifs, setUnreadNotifs] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.success) {
          const list = response.data.notifications || [];
          setUnreadNotifs(list.filter(n => !n.is_read));
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      setUnreadNotifs([]);
      // Mock db handles marking read
      await api.put('/settings', { notifications_enabled: true }); // trigger a setting write as ping
      toast.success('Notifications cleared.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate('/research', { state: { searchTicker: searchVal.trim().toUpperCase() } });
      setSearchVal('');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Screen panel */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50 h-16 flex items-center justify-between px-6 z-30">
          
          {/* Left search suggestions */}
          <form onSubmit={handleSearchSubmit} className="relative w-80 max-w-lg hidden sm:block">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('enterTicker')} 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-1.5 text-sm"
            />
          </form>
          <div className="sm:hidden text-lg font-semibold bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">InvestIQ</div>

          {/* Right Header items */}
          <div className="flex items-center gap-4">
            
            {/* Language Selector */}
            <div className="relative flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <GlobeAltIcon className="w-5 h-5" />
              <select 
                value={locale} 
                onChange={(e) => setLocale(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="en" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">EN</option>
                <option value="es" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">ES</option>
              </select>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400"
              >
                <BellIcon className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Overlay Menu */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-3 w-80 glass-panel p-4 shadow-lg flex flex-col z-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <button onClick={markAllRead} className="text-xs text-brand-500 hover:underline">Mark read</button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {unreadNotifs.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-6">All caught up! No unread notifications.</div>
                    ) : (
                      unreadNotifs.map((n, idx) => (
                        <div key={idx} className="p-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg border border-slate-200/30 dark:border-slate-700/20">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar link */}
            {user && (
              <img 
                src={user.avatar_url?.startsWith('/') ? `${API_ORIGIN}${user.avatar_url}` : user.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/10 cursor-pointer"
                onClick={() => navigate('/settings')}
              />
            )}
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;




