import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  DocumentArrowDownIcon, 
  CpuChipIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSearches: 0,
    bookmarksCount: 0,
    savedReportsCount: 0,
    tokensUsed: 0,
    avgResponseTime: 0
  });
  const [recentHistory, setRecentHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [dailyUsage, setDailyUsage] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentHistory(response.data.recentHistory || []);
          setTrending(response.data.trendingCompanies || []);
          setDailyUsage(response.data.dailyUsage || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { name: t('totalResearch'), val: stats.totalSearches, icon: MagnifyingGlassIcon, color: 'text-brand-500 bg-brand-500/10' },
    { name: t('savedReportsCount'), val: stats.savedReportsCount, icon: DocumentArrowDownIcon, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: t('activeWatchlist'), val: stats.bookmarksCount, icon: BookmarkIcon, color: 'text-pink-500 bg-pink-500/10' },
    { name: t('totalTokens'), val: stats.tokensUsed.toLocaleString(), icon: CpuChipIcon, color: 'text-amber-500 bg-amber-500/10' },
    { name: t('responseTime'), val: `${(stats.avgResponseTime / 1000).toFixed(1)}s`, icon: ClockIcon, color: 'text-emerald-500 bg-emerald-500/10' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-28 glass-panel skeleton-shimmer rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 glass-panel skeleton-shimmer rounded-2xl" />
          <div className="h-80 glass-panel skeleton-shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">{t('welcomeBack')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Here is your investment auditing activity summary.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">{card.name}</span>
                <h4 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 mt-1">{card.val}</h4>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts and items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Usage Area Chart */}
        <div className="lg:col-span-2 glass-panel p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">{t('dailyUsage')}</h3>
            <p className="text-[10px] text-slate-400">Total analytical queries completed per day.</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="searches" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trending tickers */}
        <div className="glass-panel p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">{t('trendingStocks')}</h3>
            <p className="text-[10px] text-slate-400">Most requested stock searches in the system.</p>
          </div>
          <div className="space-y-3.5">
            {trending.map((company, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate('/research', { state: { searchTicker: company.ticker } })}
                className="flex items-center justify-between p-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/50 rounded-xl cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300">0{idx + 1}</span>
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{company.ticker}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{company.company_name}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{company.searches || 1} hits</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom recent reports list */}
      <div className="glass-panel p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-sm">{t('recentActivity')}</h3>
          <p className="text-[10px] text-slate-400">Your latest stock research compilations.</p>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            {t('noActivity')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400">
                  <th className="pb-3 font-semibold">TICKER</th>
                  <th className="pb-3 font-semibold">COMPANY</th>
                  <th className="pb-3 font-semibold">DATE</th>
                  <th className="pb-3 font-semibold">SCORE</th>
                  <th className="pb-3 font-semibold">RECOMMENDATION</th>
                  <th className="pb-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((row, idx) => {
                  let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                  if (row.recommendation === 'HOLD') badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                  if (row.recommendation === 'PASS') badgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';

                  return (
                    <tr key={idx} className="border-b border-slate-100/50 dark:border-slate-800/20 hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200 font-mono">{row.ticker}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-300 font-medium">{row.company_name}</td>
                      <td className="py-3.5 text-slate-400">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 font-bold">{row.investment_score || 'N/A'}/100</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${badgeColor}`}>
                          {row.recommendation || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {row.report_id ? (
                          <button 
                            onClick={() => navigate(`/report/${row.report_id}`)}
                            className="bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg"
                          >
                            View Audit
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Report Inactive</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;



