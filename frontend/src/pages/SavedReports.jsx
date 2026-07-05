import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DocumentTextIcon, TrashIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SavedReports = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    try {
      const response = await api.get('/saved');
      if (response.data.success) {
        setReports(response.data.saved_reports || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch saved reports library.');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedReport = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this report from saved reports library?')) return;
    try {
      await api.delete(`/saved/${id}`);
      setReports(prev => prev.filter(r => r.id !== id)); // note reports array stores report under r.id
      toast.success('Report removed from library.');
    } catch (err) {
      toast.error('Failed to unsave report.');
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesQuery = [report.company_name, report.ticker]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (filter === 'ALL' || report.recommendation === filter);
  });

  const averageScore = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + Number(report.investment_score || 0), 0) / reports.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-44 glass-panel skeleton-shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="page-eyebrow">Research library</p>
          <h2 className="page-title">{t('savedReports')}</h2>
          <p className="page-subtitle">Your most important company research, organized and ready to revisit.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Reports</span>
            <strong className="text-sm text-slate-800 dark:text-white">{reports.length}</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Average score</span>
            <strong className="text-sm text-brand-600">{averageScore}/100</strong>
          </div>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="glass-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company or ticker..." className="glass-input w-full py-2 pl-9 pr-3 text-xs" />
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
            {['ALL', 'BUY', 'HOLD', 'PASS'].map((option) => (
              <button key={option} onClick={() => setFilter(option)} className={'rounded-lg px-3 py-1.5 text-[10px] font-bold transition ' + (filter === option ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800' : 'text-slate-400 hover:text-slate-700')}>
                {option === 'ALL' ? 'All reports' : option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {reports.length === 0 ? (
        <div className="glass-panel p-20 text-center flex flex-col justify-center items-center text-slate-400">
          <DocumentTextIcon className="w-12 h-12 text-slate-300 mb-4" />
          <span className="text-xs">No reports saved yet. Compile research on a stock ticker and click the Save button!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredReports.map((report) => {
            let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            if (report.recommendation === 'HOLD') badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            if (report.recommendation === 'PASS') badgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';

            return (
              <div 
                key={report.id}
                onClick={() => navigate(`/report/${report.id}`)}
                className="glass-panel p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{report.company_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{report.ticker}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold ${badgeColor}`}>{report.recommendation}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">{report.ai_summary}</p>
                </div>

                <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-3 flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-slate-400">Score: <span className="text-brand-500 font-bold">{report.investment_score}/100</span></span>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => removeSavedReport(report.id, e)}
                      className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                      title="Remove saved report"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => navigate(`/report/${report.id}`)}
                      className="p-1 hover:bg-brand-500/10 hover:text-brand-500 rounded-lg text-slate-400 transition-colors"
                      title="Open report"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default SavedReports;


