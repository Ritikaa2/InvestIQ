import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BookmarkIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Watchlist = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await api.get('/bookmarks');
      if (response.data.success) {
        setWatchlist(response.data.bookmarks || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load watchlist bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this company ticker from your watchlist?')) return;
    try {
      await api.delete(`/bookmark/${id}`);
      setWatchlist(prev => prev.filter(b => b.id !== id));
      toast.success('Ticker removed from watchlist.');
    } catch (err) {
      toast.error('Failed to remove bookmark.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-28 glass-panel skeleton-shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">{t('bookmarks')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep track of your high-potential company tickers for quick audits.</p>
      </div>

      {/* Grid List */}
      {watchlist.length === 0 ? (
        <div className="glass-panel p-20 text-center flex flex-col justify-center items-center text-slate-400">
          <BookmarkIcon className="w-12 h-12 text-slate-300 mb-4" />
          <span className="text-xs">Your watchlist is currently empty. Start searching and bookmark companies in the Research Hub.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate('/research', { state: { searchTicker: item.ticker } })}
              className="glass-panel p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-between cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">{item.ticker}</span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{item.company_name}</span>
              </div>

              <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => navigate('/research', { state: { searchTicker: item.ticker } })}
                  className="p-1.5 hover:bg-brand-500/10 hover:text-brand-500 rounded-lg text-slate-400 transition-colors"
                  title="Run equity audit"
                >
                  <SparklesIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => removeBookmark(item.id, e)}
                  className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                  title="Delete from watchlist"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Watchlist;


