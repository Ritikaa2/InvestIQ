import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [recommendationData, setRecommendationData] = useState([]);
  const [scoreData, setScoreData] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      if (response.data.success) {
        setRecommendationData(response.data.recommendationDistribution || []);
        setScoreData(response.data.scoreDistribution || []);
        setApiLogs(response.data.recentLogs || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 glass-panel skeleton-shimmer rounded-2xl" />
          <div className="h-80 glass-panel skeleton-shimmer rounded-2xl" />
        </div>
        <div className="h-64 glass-panel skeleton-shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">{t('analytics')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Analytical details for your AI token allocations and query performance logs.</p>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recommendation Pie */}
        <div className="glass-panel p-5 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left mb-4">
            <h3 className="font-semibold text-sm">Rating Distributions</h3>
            <p className="text-[10px] text-slate-400">Ratio of Buy, Hold, and Pass recommendations in saved reports.</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recommendationData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {recommendationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-[10px] font-semibold mt-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />Buy</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />Hold</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />Pass</span>
          </div>
        </div>

        {/* Scores Histogram */}
        <div className="glass-panel p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Investment Score Bands</h3>
            <p className="text-[10px] text-slate-400">Count of research dossiers in each score range.</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="url(#scoreGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* API Audit logs widget */}
      <div className="glass-panel p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-sm">Live System API Logs</h3>
          <p className="text-[10px] text-slate-400">Audit logs tracking network response times and success flags.</p>
        </div>

        <div className="overflow-x-auto max-h-72 scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 font-semibold">
                <th className="pb-2">METHOD</th>
                <th className="pb-2">ENDPOINT PATH</th>
                <th className="pb-2">RESPONSE TIME</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {apiLogs.slice(0, 10).map((log, idx) => {
                const isSuccess = log.status_code >= 200 && log.status_code < 300;
                return (
                  <tr key={idx} className="border-b border-slate-100/50 dark:border-slate-800/20 font-mono text-[10px]">
                    <td className={`py-2 font-bold ${log.method === 'POST' ? 'text-indigo-500' : 'text-emerald-500'}`}>{log.method}</td>
                    <td className="py-2 text-slate-600 dark:text-slate-300">{log.endpoint}</td>
                    <td className="py-2 text-slate-400">{log.response_time_ms} ms</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold ${
                        isSuccess ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>{log.status_code}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Analytics;


