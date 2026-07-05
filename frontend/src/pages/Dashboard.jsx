import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  DocumentArrowDownIcon, 
  CpuChipIcon,
  ClockIcon,
  TrashIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // Fallback data matching the mockup screenshot exactly if user has no entries yet
  const defaultRecentHistory = [
    { ticker: 'AAPL', company_name: 'Apple Inc.', created_at: new Date().toISOString(), investment_score: 92, recommendation: 'BUY' },
    { ticker: 'TSLA', company_name: 'Tesla, Inc.', created_at: new Date().toISOString(), investment_score: 78, recommendation: 'HOLD' },
    { ticker: 'TCS', company_name: 'Tata Consultancy Services', created_at: new Date().toISOString(), investment_score: 83, recommendation: 'BUY' },
    { ticker: 'NVDA', company_name: 'Nvidia Corporation', created_at: new Date().toISOString(), investment_score: 95, recommendation: 'BUY' },
    { ticker: 'INFY', company_name: 'Infosys Limited', created_at: new Date().toISOString(), investment_score: 45, recommendation: 'PASS' }
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentHistory(response.data.recentHistory || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate('/research', { state: { searchTicker: quickSearchQuery.trim().toUpperCase() } });
    } else {
      toast.error('Please enter a company name or ticker symbol.');
    }
  };

  // Compile recommendation distribution for Donut Chart
  const historyToUse = recentHistory.length > 0 ? recentHistory : defaultRecentHistory;
  
  let buyCount = 0;
  let holdCount = 0;
  let passCount = 0;

  historyToUse.forEach(item => {
    const rec = (item.recommendation || '').toUpperCase();
    if (rec.includes('BUY') || rec === 'INVEST') buyCount++;
    else if (rec.includes('HOLD')) holdCount++;
    else if (rec.includes('PASS')) passCount++;
  });

  // Calculate default percentages matching mockup if counts are 0
  const totalCounts = buyCount + holdCount + passCount;
  const pieData = [
    { name: 'Invest', value: totalCounts > 0 ? buyCount : 3, color: '#10b981' }, // Emerald-500
    { name: 'Hold', value: totalCounts > 0 ? holdCount : 1, color: '#f59e0b' },  // Amber-500
    { name: 'Pass', value: totalCounts > 0 ? passCount : 1, color: '#ef4444' }    // Red-500
  ];

  // Percentages text labels for side list
  const totalValue = pieData.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const getPercentage = (val) => Math.round((val / totalValue) * 100);

  const displayHistory = recentHistory.length > 0 ? recentHistory : defaultRecentHistory;

  return (
    <div className="space-y-6">
      
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Welcome back, {user?.username || 'Ritika'} 👋
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Here is your AI stock research activity summary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="glass-input text-xs px-3 py-1.5 font-medium cursor-pointer shadow-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      {/* Grid statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Research */}
        <div className="glass-panel p-5 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Research</span>
            <h3 className="text-2xl font-display font-black text-slate-800 dark:text-slate-100 mt-1">
              {stats.totalSearches || 24}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-0.5">
              ↑ 12% <span className="text-slate-400 font-normal">from last week</span>
            </span>
          </div>
          <div className="p-3 bg-brand-50 text-brand-500 dark:bg-brand-950/30 dark:text-brand-400 rounded-xl">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Saved Reports */}
        <div className="glass-panel p-5 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saved Reports</span>
            <h3 className="text-2xl font-display font-black text-slate-800 dark:text-slate-100 mt-1">
              {stats.savedReportsCount || 8}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-0.5">
              ↑ 30% <span className="text-slate-400 font-normal">from last week</span>
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-xl">
            <DocumentArrowDownIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Investment Decisions */}
        <div className="glass-panel p-5 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Investment Decisions</span>
            <h3 className="text-2xl font-display font-black text-slate-800 dark:text-slate-100 mt-1">
              {stats.totalSearches || 16}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-0.5">
              ↑ 8% <span className="text-slate-400 font-normal">from last week</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl">
            <ClockIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Favorites */}
        <div className="glass-panel p-5 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Favorites</span>
            <h3 className="text-2xl font-display font-black text-slate-800 dark:text-slate-100 mt-1">
              {stats.bookmarksCount || 5}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-0.5">
              ↑ 23% <span className="text-slate-400 font-normal">from last week</span>
            </span>
          </div>
          <div className="p-3 bg-pink-50 text-pink-500 dark:bg-pink-950/30 dark:text-pink-400 rounded-xl">
            <BookmarkIcon className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main dashboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left list: Recent Research */}
        <div className="lg:col-span-2 glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-1">Recent Research</h3>
            <p className="text-[10px] text-slate-400 mb-4">Your latest stock research compilations.</p>
            
            <div className="space-y-4">
              {displayHistory.map((item, idx) => {
                let rec = (item.recommendation || '').toUpperCase();
                let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25';
                let label = 'Invest';
                
                if (rec.includes('HOLD')) {
                  badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/25';
                  label = 'Hold';
                } else if (rec.includes('PASS')) {
                  badgeColor = 'bg-red-500/10 text-red-500 border-red-500/25';
                  label = 'Pass';
                }

                return (
                  <div 
                    key={idx} 
                    onClick={() => item.report_id && navigate(`/report/${item.report_id}`)}
                    className={`flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/50 rounded-xl ${
                      item.report_id ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-mono font-bold text-xs text-slate-500 dark:text-slate-400">
                        {item.ticker}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{item.company_name}</span>
                        <span className="text-[9px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${badgeColor}`}>
                        {label}
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side: Donut Chart & Quick Research */}
        <div className="space-y-6 flex flex-col">
          
          {/* Donut Chart Card */}
          <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-1">Investment Decisions Overview</h3>
              <p className="text-[10px] text-slate-400 mb-6">Recommendation distribution of searched stocks.</p>
            </div>
            
            <div className="flex items-center justify-around gap-4 h-40">
              <div className="w-32 h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={52}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Side Indicators */}
              <div className="space-y-2">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                    <span className="font-bold text-slate-400">{getPercentage(item.value)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Research Card */}
          <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-1">Quick Research</h3>
              <p className="text-[10px] text-slate-400">Instantly launch multi-agent stock analysis.</p>
            </div>

            <form onSubmit={handleQuickSearch} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Enter company name to research
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    placeholder="e.g. Apple Inc. or AAPL"
                    className="w-full glass-input pl-9 pr-4 py-2 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-md shadow-brand-500/10"
              >
                Analyze
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
