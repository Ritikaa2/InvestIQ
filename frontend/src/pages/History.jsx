import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MagnifyingGlassIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const History = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/history');
      if (response.data.success) {
        setHistory(response.data.history || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load search history.');
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (reportId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this research audit?')) return;
    
    try {
      await api.delete(`/report/${reportId}`);
      setHistory(prev => prev.filter(item => item.report_id !== reportId));
      toast.success('Research history record deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  const filteredHistory = history.filter(item => 
    (item.ticker || '').toLowerCase().includes(filterQuery.toLowerCase()) || 
    (item.company_name || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
        <div className="h-12 w-full skeleton-shimmer rounded-xl" />
        <div className="h-96 w-full glass-panel skeleton-shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">{t('history')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View and manage all your historical agent research logs.</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search query..." 
          value={filterQuery}
          onChange={(e) => { setFilterQuery(e.target.value); setCurrentPage(1); }}
          className="w-full glass-input pl-10 pr-4 py-2 text-xs shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80"
        />
      </div>

      {/* Table Card */}
      <div className="glass-panel bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-lg p-6">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 text-xs text-slate-400">
            No history records match your search.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 text-left">Company</th>
                    <th className="pb-3 text-left">Decision</th>
                    <th className="pb-3 text-left">Score</th>
                    <th className="pb-3 text-left">Date</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((row) => {
                    let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                    let label = 'Invest';
                    const rec = (row.recommendation || '').toUpperCase();
                    
                    if (rec.includes('HOLD')) {
                      badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                      label = 'Hold';
                    } else if (rec.includes('PASS')) {
                      badgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';
                      label = 'Pass';
                    }

                    return (
                      <tr 
                        key={row.id} 
                        onClick={() => row.report_id && navigate(`/report/${row.report_id}`)}
                        className="border-b border-slate-100/50 dark:border-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                      >
                        {/* Company Name & Ticker Column */}
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                              {row.company_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">
                              {row.ticker}
                            </span>
                          </div>
                        </td>

                        {/* Decision Column */}
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                            {label}
                          </span>
                        </td>

                        {/* Score Column */}
                        <td className="py-4 font-bold text-slate-700 dark:text-slate-350">
                          {row.investment_score || 'N/A'}/100
                        </td>

                        {/* Date Column */}
                        <td className="py-4 text-slate-400">
                          {formatDate(row.created_at)}
                        </td>

                        {/* Action Column */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => row.report_id && navigate(`/report/${row.report_id}`)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                              title="View report"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {row.report_id && (
                              <button
                                onClick={(e) => deleteHistoryItem(row.report_id, e)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete report"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-[10px] text-slate-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length} runs
                </span>
                <div className="flex gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 text-xs rounded-lg transition-colors border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 text-xs rounded-lg transition-colors border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default History;
