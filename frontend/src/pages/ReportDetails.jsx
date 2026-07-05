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
  ClipboardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon } from '@heroicons/react/24/solid';
import { 
  RevenueBarChart, 
  ProfitFCFChart, 
  SentimentGauge, 
  CompetitorPieChart,
  FinancialPerformanceLineChart
} from '../components/ReportCharts';
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
      if (err.response?.status === 409) {
        setIsBookmarked(true);
        toast.success('Company is already in watchlist.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to bookmark.');
      }
    }
  };

  const copyReportLink = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success('Report JSON copied to clipboard.');
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

  // Extract financial data for calculations
  const financialHistory = report?.financials?.financialHistory || [];
  const latestFinancial = financialHistory[financialHistory.length - 1] || {};
  const previousFinancial = financialHistory[financialHistory.length - 2] || {};
  const growthPercent = previousFinancial.revenue
    ? ((latestFinancial.revenue - previousFinancial.revenue) / previousFinancial.revenue) * 100
    : 0;
  const netMargin = latestFinancial.revenue
    ? (latestFinancial.profit / latestFinancial.revenue) * 100
    : 0;
  const cashConversion = latestFinancial.profit
    ? (latestFinancial.freeCashFlow / latestFinancial.profit) * 100
    : 0;
  const debtToRevenue = latestFinancial.revenue
    ? latestFinancial.totalDebt / latestFinancial.revenue
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Back button link */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Back to Library
      </button>

      {/* Header Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Archive Library</span>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
            {report.profile.companyName} <span className="font-mono text-brand-500 text-2xl">({report.profile.ticker})</span>
          </h1>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={bookmarkTicker} className="icon-button" title="Favorite Company">
            {isBookmarked ? <StarIcon className="w-5 h-5 text-amber-500" /> : <HeartIcon className="w-5 h-5 text-slate-500" />}
          </button>
          <button onClick={copyReportLink} className="icon-button" title="Copy report data">
            <ClipboardIcon className="w-4 h-4" />
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-xl border border-slate-250 bg-slate-50 px-4 py-2.5 text-xs font-bold text-emerald-600 dark:border-slate-800 dark:bg-slate-900"
          >
            <CheckIcon className="w-4 h-4" />
            Saved to Library
          </button>
          
          <a 
            href={`${API_BASE_URL}/report/${id}/pdf?token=${localStorage.getItem('token')}`}
            target="_blank"
            rel="noreferrer"
            className="primary-button text-xs font-bold text-white shadow-md shadow-brand-500/10 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </div>

      {/* Main Two-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column - Core recommendation & Tab contents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Recommendation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Card: Investment Decision */}
            <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm flex flex-col justify-between min-h-[140px] md:col-span-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Investment Recommendation</span>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-4 py-1.5 text-base font-black rounded-xl uppercase tracking-wider border ${
                    report.decision.recommendation === 'BUY' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : (report.decision.recommendation === 'HOLD' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')
                  }`}>
                    {report.decision.recommendation === 'BUY' ? 'Invest' : report.decision.recommendation.toLowerCase()}
                  </span>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Investment Score</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100">{report.decision.investmentScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Little Score Slider bar */}
              <div className="w-full h-1.5 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    report.decision.investmentScore >= 80 
                      ? 'bg-emerald-500' 
                      : (report.decision.investmentScore >= 70 ? 'bg-amber-500' : 'bg-red-500')
                  }`}
                  style={{ width: `${report.decision.investmentScore}%` }}
                />
              </div>
            </div>

            {/* Right Card: Key Highlights */}
            <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm flex flex-col justify-between md:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Key Highlights</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  {(report.decision.coreRationale || []).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mt-0.5 shrink-0">
                        <CheckIcon className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-slate-200/50 dark:border-slate-800/50 overflow-x-auto gap-2">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'financials', name: 'Financials' },
              { id: 'swot', name: 'SWOT' },
              { id: 'news', name: 'News' },
              { id: 'risks', name: 'Risks' },
              { id: 'opportunities', name: 'Opportunities' },
              { id: 'reasoning', name: 'AI Reasoning' },
              { id: 'investment_guide', name: 'Investment Guide' }
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

          {/* Tab contents panel */}
          <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm min-h-60">
            
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm mb-2 text-slate-800 dark:text-slate-100">Company Overview</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{report.profile.overview || report.profile.description}</p>
                </div>
                
                {/* Financial summary blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Revenue</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mt-1">
                      ${((latestFinancial.revenue || 0) / 1e9).toFixed(2)}B
                    </span>
                    <span className="text-[8px] text-emerald-500 font-bold block mt-0.5">↑ {growthPercent.toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Net Income</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mt-1">
                      ${((latestFinancial.profit || 0) / 1e9).toFixed(2)}B
                    </span>
                    <span className="text-[8px] text-emerald-500 font-bold block mt-0.5">↑ {netMargin.toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Market Capitalization</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mt-1">
                      ${(report.financials.marketCap / 1e9).toFixed(2)}B
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">P/E Ratio</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mt-1">
                      {report.financials.peRatio?.toFixed(1) || '28.5'}x
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-850 pt-5 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Headquarters</span>
                    <span className="block mt-1 font-bold">{report.profile.headquarters || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">CEO</span>
                    <span className="block mt-1 font-bold">{report.profile.ceo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Industry</span>
                    <span className="block mt-1 font-bold">{report.profile.industry || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sector</span>
                    <span className="block mt-1 font-bold">{report.profile.sector || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Financials */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                <div>
                  <p className="page-eyebrow">Financial intelligence</p>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h4 className="text-lg font-display font-bold text-slate-900 dark:text-white">Performance & cash quality</h4>
                      <p className="text-xs text-slate-500">A decision-ready view of growth, profitability, cash conversion, and leverage.</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">Latest fiscal year: {latestFinancial.year || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: 'Revenue growth', value: growthPercent.toFixed(1) + '%', tone: growthPercent >= 0 ? 'text-emerald-600' : 'text-red-500', note: 'year over year' },
                    { label: 'Net margin', value: netMargin.toFixed(1) + '%', tone: 'text-blue-600', note: 'profit efficiency' },
                    { label: 'Cash conversion', value: cashConversion.toFixed(0) + '%', tone: 'text-violet-600', note: 'FCF / net income' },
                    { label: 'Debt / revenue', value: debtToRevenue.toFixed(2) + 'x', tone: debtToRevenue < 0.5 ? 'text-emerald-600' : 'text-amber-600', note: 'balance-sheet load' }
                  ].map((metric) => (
                    <div key={metric.label} className="soft-card p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{metric.label}</span>
                      <div className={'mt-2 text-2xl font-display font-extrabold ' + metric.tone}>{metric.value}</div>
                      <span className="mt-1 block text-[10px] text-slate-400">{metric.note}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-xs mb-3 text-slate-500 uppercase">Revenue Growth Trend</h5>
                    <RevenueBarChart data={financialHistory} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs mb-3 text-slate-500 uppercase">Profit & Free Cash Flow</h5>
                    <ProfitFCFChart data={financialHistory} />
                  </div>
                </div>

                {/* Data Table */}
                <div className="border-t border-slate-100 dark:border-slate-850 pt-6">
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
                        {financialHistory.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100/50 dark:border-slate-800/20">
                            <td className="py-2.5 font-bold font-mono">{row.year}</td>
                            <td className="py-2.5 text-slate-600 dark:text-slate-350">${(row.revenue / 1e9).toFixed(2)}B</td>
                            <td className="py-2.5 text-slate-600 dark:text-slate-350">${(row.profit / 1e9).toFixed(2)}B</td>
                            <td className="py-2.5 text-slate-600 dark:text-slate-350">${(row.freeCashFlow / 1e9).toFixed(2)}B</td>
                            <td className="py-2.5 text-slate-600 dark:text-slate-350">${(row.totalDebt / 1e9).toFixed(2)}B</td>
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

            {/* News */}
            {activeTab === 'news' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="shrink-0 w-44">
                    <SentimentGauge score={report.news.sentimentScore || 75} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-500 uppercase mb-2">Headline Sentiment Summary</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{report.news.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <h6 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase mb-2">Bullish Catalysts</h6>
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-300">
                      {report.news.bullishCatalysts.map((cat, i) => <li key={i}>- {cat}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/10 rounded-xl">
                    <h6 className="font-bold text-xs text-red-600 dark:text-red-400 uppercase mb-2">Bearish Catalysts</h6>
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-300">
                      {report.news.bearishCatalysts.map((cat, i) => <li key={i}>- {cat}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Risks */}
            {activeTab === 'risks' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm mb-1 text-slate-800 dark:text-slate-100">Audit Risk Matrix</h4>
                  <p className="text-xs text-slate-400">Synthesized risk rating: <span className="font-bold text-brand-500">{report.risks.riskRating}</span></p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                    <h5 className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[10px]">Business Risks</h5>
                    <ul className="space-y-1">
                      {report.risks.businessRisks.map((r, i) => <li key={i} className="text-slate-500 dark:text-slate-400">- {r}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                    <h5 className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[10px]">Political / Regulatory</h5>
                    <ul className="space-y-1">
                      {report.risks.politicalRisks.map((r, i) => <li key={i} className="text-slate-500 dark:text-slate-400">- {r}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                    <h5 className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[10px]">Macro-Economic</h5>
                    <ul className="space-y-1">
                      {report.risks.economicRisks.map((r, i) => <li key={i} className="text-slate-500 dark:text-slate-400">- {r}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                    <h5 className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[10px]">Technology / Cyber</h5>
                    <ul className="space-y-1">
                      {report.risks.technologyRisks.map((r, i) => <li key={i} className="text-slate-500 dark:text-slate-400">- {r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Opportunities */}
            {activeTab === 'opportunities' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Growth Opportunities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.swot.opportunities.map((opp, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl">
                      <span className="text-[10px] font-bold text-brand-500 uppercase block mb-1">Opportunity 0{idx+1}</span>
                      <p className="text-xs text-slate-650 dark:text-slate-350 font-medium leading-relaxed">{opp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {activeTab === 'reasoning' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Committee Rationale Summary</h4>
                  <p className="text-[10px] text-slate-400">Direct rationale compiled from security audit variables.</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-5">
                  {report.decision.coreRationale.map((rat, i) => <li key={i} className="leading-relaxed font-medium">{rat}</li>)}
                </ul>
                <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h5 className="font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wide">Executive Dossier Summary</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 italic font-medium">"{report.decision.aiSummary}"</p>
                </div>
              </div>
            )}

            {/* Investment Guide */}
            {activeTab === 'investment_guide' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                    Investment Guide & Strategy
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Customized execution strategy based on the multi-agent equity audit for <strong>{report.profile.companyName} ({report.profile.ticker})</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Step-by-Step Investment execution */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
                    <h5 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                      How to Invest (Execution Checklist)
                    </h5>
                    <ol className="space-y-3 list-decimal pl-4 text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      <li>
                        <strong>Select Brokerage Account:</strong> Sign in or register with a verified brokerage platform (e.g., Robinhood, Fidelity, Interactive Brokers, E*TRADE).
                      </li>
                      <li>
                        <strong>Determine Order Type:</strong> Use a <em>Limit Order</em> to specify your desired entry price, rather than a Market Order, to protect against market spread.
                      </li>
                      <li>
                        <strong>Risk-Averse Sizing:</strong> We recommend a <strong>Dollar-Cost Averaging (DCA)</strong> approach, splitting your capital into 3-4 tranches over 2-3 months to mitigate timing risk.
                      </li>
                      <li>
                        <strong>Define Stop-Loss Limits:</strong> Set a trailing stop-loss of 10% to 15% below your average cost basis to protect your downside from unforeseen market volatility.
                      </li>
                    </ol>
                  </div>

                  {/* Portfolio allocation recommendations */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider mb-3">
                        Model Allocation Strategy
                      </h5>
                      <div className="space-y-2 text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                        <p>
                          <strong>Recommendation Class:</strong> <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            report.decision.recommendation === 'BUY' 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : (report.decision.recommendation === 'HOLD' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')
                          }`}>{report.decision.recommendation}</span>
                        </p>
                        <p>
                          <strong>Suggested Portfolio Weight:</strong> {report.decision.investmentScore >= 80 ? '4% - 5%' : (report.decision.investmentScore >= 70 ? '2% - 3%' : '0% - 1%')} of total equity portfolio.
                        </p>
                        <p>
                          <strong>Hold Horizon:</strong> Medium to Long Term (12 to 36 months) to allow structural moats and AI expansions to materialize.
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 block mb-1">AUDIT SUMMARY NOTE</span>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 font-medium leading-relaxed">
                        This report is synthesized via multi-agent state evaluations. Past performance is not indicative of future returns. Invest responsibly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Elaborate each feature of the system */}
                <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-3">
                  <h5 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                    Detailed Feature Guide (How It Works)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-650 dark:text-slate-350">
                    <div className="p-3 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl">
                      <span className="font-bold text-brand-500 block mb-1">1. Investment Score</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        An aggregated health score (0-100) combining fundamental balance sheets, P/E multiples, strategic SWOT, and peer moats.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl">
                      <span className="font-bold text-brand-500 block mb-1">2. Confidence Level</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Represents model mathematical certainty based on dataset completeness, news sentiment convergence, and risk matrix parameters.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl">
                      <span className="font-bold text-brand-500 block mb-1">3. News Sentiment</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Natural language processing of recent global press releases and headlines, identifying active bullish and bearish catalysts.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl">
                      <span className="font-bold text-brand-500 block mb-1">4. SWOT Map</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Identifies internal Strengths & Weaknesses against external Opportunities & Threats to chart long-term strategic viability.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl">
                      <span className="font-bold text-brand-500 block mb-1">5. Competitor Matrix</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Compares estimated market shares, advantages, and system vulnerabilities against industry peers to estimate economic moats.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl">
                      <span className="font-bold text-brand-500 block mb-1">6. Risk Meter</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        A synthesized threat rating compiled across Business, Cyber, Regulatory, and Macro-Economic threat dimensions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column - Side widgets */}
        <div className="space-y-6">
          
          {/* Financial Performance Line Chart */}
          <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Financial Performance</h4>
            <p className="text-[10px] text-slate-400 mb-4">Revenue and Net Income trends over the last 5 years.</p>
            <FinancialPerformanceLineChart data={financialHistory} />
          </div>

          {/* Risk Meter half-gauge */}
          <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Risk Meter</h4>
              <p className="text-[10px] text-slate-400 mb-4">Synthesized threat auditing meter.</p>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <SentimentGauge score={report.risks.riskRating === 'Low' ? 85 : (report.risks.riskRating === 'Medium' ? 50 : 20)} />
            </div>
            <div className="text-center mt-4">
              <span className="text-xs font-bold text-slate-500">Threat Level: </span>
              <span className={`text-xs font-black uppercase ${
                report.risks.riskRating === 'Low' ? 'text-emerald-500' : (report.risks.riskRating === 'Medium' ? 'text-amber-500' : 'text-red-500')
              }`}>{report.risks.riskRating}</span>
            </div>
          </div>

          {/* AI Reasoning Summary Panel */}
          <div className="glass-panel p-6 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Reasoning</h4>
              <p className="text-[10px] text-slate-400">Core recommendations and auditing justification.</p>
            </div>
            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
              {report.decision.aiSummary}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ReportDetails;
