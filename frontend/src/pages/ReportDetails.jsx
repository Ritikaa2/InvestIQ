import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon, 
  HeartIcon, 
  SparklesIcon, 
  CheckIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { RevenueBarChart, ProfitFCFChart, SentimentGauge, CompetitorPieChart } from '../components/ReportCharts';
import toast from 'react-hot-toast';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      const response = await api.get(`/report/${id}`);
      if (response.data.success) {
        const rep = response.data.report;
        setReport(rep.report_data);
        setIsSaved(true); // Since we loaded it, it's in the DB
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load investment report details.');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const bookmarkTicker = async () => {
    try {
      if (isBookmarked) return;
      await api.post('/bookmark', { ticker: report.profile.ticker, company_name: report.profile.companyName });
      setIsBookmarked(true);
      toast.success('Added ticker to watchlist.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bookmark.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
        <div className="h-28 w-full glass-panel skeleton-shimmer rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 glass-panel skeleton-shimmer rounded-2xl" />
          <div className="h-44 glass-panel skeleton-shimmer rounded-2xl" />
          <div className="h-44 glass-panel skeleton-shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      
      {/* Back button link */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Back to Library
      </button>

      {/* Header metadata row */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-brand-500/10 shadow-lg">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equity Audit Report</span>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 mt-1">{report.profile.companyName} <span className="font-mono text-brand-500">({report.profile.ticker})</span></h1>
          <p className="text-xs text-slate-400 mt-1">Loaded from secure archive database.</p>
        </div>

        {/* Recommendation badge & action lists */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col items-center px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[9px] text-slate-400 font-bold uppercase">Committee Decision</span>
            <span className={`text-xl font-black mt-0.5 ${
              report.decision.recommendation === 'BUY' ? 'text-emerald-500' : (report.decision.recommendation === 'HOLD' ? 'text-amber-500' : 'text-red-500')
            }`}>{report.decision.recommendation}</span>
          </div>
          
          {/* Actions */}
          <div className="flex gap-1.5">
            <button 
              onClick={bookmarkTicker}
              className="p-2.5 glass-panel hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
              title="Bookmark Company"
            >
              {isBookmarked ? <HeartIconSolid className="w-5 h-5 text-pink-500" /> : <HeartIcon className="w-5 h-5" />}
            </button>
            <button 
              className="p-2.5 glass-panel bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400"
              disabled
              title="Report is Saved"
            >
              <CheckIcon className="w-5 h-5 text-emerald-500" />
            </button>
            <a 
              href={`${API_BASE_URL}/report/${id}/pdf?token=${localStorage.getItem('token')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 glass-panel hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
              title="Download PDF Report"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Core score cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 text-center flex flex-col justify-center items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase mb-2">Investment Score</span>
          <div className="w-28 h-28 rounded-full border-[10px] border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
            <span className="text-3xl font-display font-black text-brand-500">{report.decision.investmentScore}</span>
            <span className="text-[9px] text-slate-400 absolute bottom-3">/ 100</span>
          </div>
        </div>
        
        <div className="glass-panel p-5 text-center flex flex-col justify-center items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase mb-2">Confidence Level</span>
          <div className="w-28 h-28 rounded-full border-[10px] border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
            <span className="text-3xl font-display font-black text-indigo-500">{report.decision.confidenceScore}%</span>
            <span className="text-[9px] text-slate-400 absolute bottom-3">Certainty</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">News Sentiment</span>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">{report.news.overallSentiment}</h4>
          </div>
          <SentimentGauge score={report.news.sentimentScore || 75} />
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/50 overflow-x-auto gap-2">
        {[
          { id: 'overview', name: 'Overview' },
          { id: 'financials', name: 'Financials' },
          { id: 'swot', name: 'SWOT Map' },
          { id: 'competitors', name: 'Competitors' },
          { id: 'risks', name: 'Risk Assessment' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 font-semibold text-xs border-b-2 shrink-0 transition-colors ${
              activeTab === tab.id 
                ? 'border-brand-500 text-brand-500' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab contents */}
      <div className="glass-panel p-6 min-h-80 shadow-md">
        
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-sm mb-2 text-slate-800 dark:text-slate-100">Business Model overview</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{report.profile.overview || report.profile.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-slate-200/30 dark:border-slate-800/30 pt-6">
              <div>
                <h5 className="font-bold text-xs text-slate-400 uppercase">Headquarters</h5>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mt-1">{report.profile.headquarters || 'N/A'}</span>
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-400 uppercase">Chief Executive Officer (CEO)</h5>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mt-1">{report.profile.ceo || 'N/A'}</span>
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-400 uppercase">Primary Sector</h5>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mt-1">{report.profile.sector || 'N/A'}</span>
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-400 uppercase">Industry Class</h5>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mt-1">{report.profile.industry || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Financials */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-xs mb-3 text-slate-500 uppercase">Revenue Growth Trend</h5>
                <RevenueBarChart data={report.financials.financialHistory} />
              </div>
              <div>
                <h5 className="font-bold text-xs mb-3 text-slate-500 uppercase">Profit & Free Cash Flow</h5>
                <ProfitFCFChart data={report.financials.financialHistory} />
              </div>
            </div>

            <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-6">
              <h4 className="font-bold text-xs text-slate-500 uppercase mb-3">Historical Reports Table</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 font-semibold">
                      <th className="pb-2">Year</th>
                      <th className="pb-2">Revenue</th>
                      <th className="pb-2">Net Income</th>
                      <th className="pb-2">Free Cash Flow</th>
                      <th className="pb-2">Total Debt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.financials.financialHistory.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100/50 dark:border-slate-800/20">
                        <td className="py-2.5 font-bold font-mono">{row.year}</td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">${(row.revenue / 1e9).toFixed(2)}B</td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">${(row.profit / 1e9).toFixed(2)}B</td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">${(row.freeCashFlow / 1e9).toFixed(2)}B</td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">${(row.totalDebt / 1e9).toFixed(2)}B</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SWOT */}
        {activeTab === 'swot' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
              <h5 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase">Strengths</h5>
              <ul className="space-y-1.5">
                {report.swot.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">- {s}</li>)}
              </ul>
            </div>
            
            <div className="p-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
              <h5 className="font-bold text-xs text-red-600 dark:text-red-400 uppercase">Weaknesses</h5>
              <ul className="space-y-1.5">
                {report.swot.weaknesses.map((w, i) => <li key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">- {w}</li>)}
              </ul>
            </div>

            <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-2">
              <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase">Opportunities</h5>
              <ul className="space-y-1.5">
                {report.swot.opportunities.map((o, i) => <li key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">- {o}</li>)}
              </ul>
            </div>

            <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
              <h5 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase">Threats</h5>
              <ul className="space-y-1.5">
                {report.swot.threats.map((t, i) => <li key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">- {t}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Competitors */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-xs text-slate-500 uppercase mb-3">Peers Market Share Summary</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{report.competitors.marketShareSummary}</p>
                <CompetitorPieChart competitors={report.competitors.competitors} />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-500 uppercase mb-3">Competitive Advantage Analysis</h5>
                <div className="space-y-3">
                  {report.competitors.competitors.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl border border-slate-200/20 dark:border-slate-800/20">
                      <h6 className="font-bold text-xs text-slate-700 dark:text-slate-200">{c.name} (Share: {c.marketShareEstimated})</h6>
                      <div className="grid grid-cols-2 gap-3 mt-1.5 text-[10px]">
                        <div>
                          <span className="text-slate-400">Moat:</span>
                          <span className="text-emerald-500 block font-semibold">{c.keyAdvantage}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Weakness:</span>
                          <span className="text-red-500 block font-semibold">{c.keyDisadvantage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200/30 dark:border-slate-800/30 pt-6">
              <div>
                <h5 className="font-bold text-xs text-emerald-600 uppercase mb-2">Our Advantages</h5>
                <ul className="space-y-1">
                  {report.competitors.clientAdvantages.map((a, i) => <li key={i} className="text-xs text-slate-500 dark:text-slate-400">- {a}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-xs text-red-600 uppercase mb-2">Our Vulnerabilities</h5>
                <ul className="space-y-1">
                  {report.competitors.clientDisadvantages.map((d, i) => <li key={i} className="text-xs text-slate-500 dark:text-slate-400">- {d}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Risks */}
        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-sm mb-3 text-slate-800 dark:text-slate-100">Audit Risk Matrix</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Synthesized risk rating category: <span className="font-bold text-brand-500">{report.risks.riskRating}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-slate-600 dark:text-slate-300 uppercase">Business Risks</h5>
                <ul className="space-y-1">
                  {report.risks.businessRisks.map((r, i) => <li key={i} className="text-xs text-slate-500 dark:text-slate-400">- {r}</li>)}
                </ul>
              </div>

              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-slate-600 dark:text-slate-300 uppercase">Political / Regulatory</h5>
                <ul className="space-y-1">
                  {report.risks.politicalRisks.map((r, i) => <li key={i} className="text-xs text-slate-500 dark:text-slate-400">- {r}</li>)}
                </ul>
              </div>

              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-slate-600 dark:text-slate-300 uppercase">Macro-Economic</h5>
                <ul className="space-y-1">
                  {report.risks.economicRisks.map((r, i) => <li key={i} className="text-xs text-slate-500 dark:text-slate-400">- {r}</li>)}
                </ul>
              </div>

              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-slate-600 dark:text-slate-300 uppercase">Technology / Cyber</h5>
                <ul className="space-y-1">
                  {report.risks.technologyRisks.map((r, i) => <li key={i} className="text-xs text-slate-500 dark:text-slate-400">- {r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Committee Rationale & AI summary */}
      <div className="glass-panel p-6 border-slate-200/50 dark:border-slate-800/50 space-y-4">
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Committee Justification Rationale</h4>
          <p className="text-[10px] text-slate-400">Direct rationale compiled from security variables.</p>
        </div>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-5">
          {report.decision.coreRationale.map((rat, i) => <li key={i} className="leading-relaxed">{rat}</li>)}
        </ul>
        <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-4 mt-4">
          <h5 className="font-bold text-xs text-slate-700 dark:text-slate-200">Executive Dossier Summary</h5>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 italic">"{report.decision.aiSummary}"</p>
        </div>
      </div>

    </div>
  );
};

export default ReportDetails;



