import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL, api } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MagnifyingGlassIcon,
  SparklesIcon, 
  ArrowDownTrayIcon, 
  HeartIcon, 
  ShareIcon, 
  ClipboardIcon, 
  PrinterIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { RevenueBarChart, ProfitFCFChart, SentimentGauge, CompetitorPieChart } from '../components/ReportCharts';
import toast from 'react-hot-toast';

const ResearchWorkspace = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  // Search States
  const [ticker, setTicker] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Workflow states
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([
    { id: 1, name: 'Profile Research', status: 'pending', log: 'Queueing agent request...' },
    { id: 2, name: 'Financial Analysis', status: 'pending', log: 'Awaiting financial ingest...' },
    { id: 3, name: 'News Intelligence', status: 'pending', log: 'Awaiting sentiment analysis...' },
    { id: 4, name: 'Competitor Analysis', status: 'pending', log: 'Awaiting market share compare...' },
    { id: 5, name: 'SWOT Assessment', status: 'pending', log: 'Awaiting strategic matrix...' },
    { id: 6, name: 'Risk Evaluation', status: 'pending', log: 'Awaiting risk calculation...' },
    { id: 7, name: 'Investment Decision', status: 'pending', log: 'Awaiting final recommendations...' }
  ]);
  const [logs, setLogs] = useState([]);
  const logTerminalRef = useRef(null);

  // Report States
  const [report, setReport] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check navigation shortcut
  useEffect(() => {
    if (location.state?.searchTicker) {
      handleRunResearch(location.state.searchTicker);
    }
  }, [location.state]);

  // Handle Autocomplete Suggestions with debounce
  useEffect(() => {
    if (!ticker.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await api.get(`/suggestions?query=${ticker}`);
        if (response.data.success) {
          setSuggestions(response.data.suggestions);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [ticker]);

  // Terminal scroll helper
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleRunResearch = async (targetTicker) => {
    const searchVal = (targetTicker || ticker).toUpperCase().trim();
    if (!searchVal) return;

    setTicker(searchVal);
    setShowSuggestions(false);
    setIsRunning(true);
    setReport(null);
    setLogs([`[System] Launching multi-agent equity audit for ${searchVal}...`]);
    setActiveStep(0);
    setIsBookmarked(false);
    setIsSaved(false);
    
    // Reset steps status
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', log: '' })));

    try {
      const response = await fetch(`${API_BASE_URL}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ticker: searchVal })
      });

      if (!response.body) throw new Error('ReadableStream not supported by browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // SSE format: event: name \n data: JSON
          if (trimmed.startsWith('data: ')) {
            try {
              const payload = JSON.parse(trimmed.slice(6));
              
              // Handle progress events
              if (payload.step !== undefined) {
                const stepIdx = payload.step - 1;
                setActiveStep(payload.step);

                setSteps(prev => prev.map((s, idx) => {
                  if (idx < stepIdx) return { ...s, status: 'completed' };
                  if (idx === stepIdx) return { ...s, status: payload.status, log: payload.log };
                  return s;
                }));

                setLogs(prev => [...prev, `[${payload.name}] ${payload.log}`]);
              }

              // Handle generic SSE completes
              if (payload.reportId) {
                setReportId(payload.reportId);
                setReport(payload.data);
                // Mark all steps as complete
                setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
                setIsRunning(false);
                toast.success('Agent research dossier compiled successfully!');
              }

              // Handle general errors
              if (payload.message && trimmed.includes('"error"')) {
                setLogs(prev => [...prev, `[ERROR] ${payload.message}`]);
                setIsRunning(false);
                toast.error(payload.message);
              }
            } catch (e) {
              // Ignore parse errors from partial buffers
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `[CRITICAL ERROR] ${err.message}`]);
      setIsRunning(false);
      toast.error('Connection failed during agent execution.');
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

  const saveReportToDashboard = async () => {
    try {
      if (isSaved) return;
      await api.post('/save-report', { report_id: reportId });
      setIsSaved(true);
      toast.success('Report saved to library.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save report.');
    }
  };

  const copyReportLink = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success('Report JSON copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      
      {/* Search inputs */}
      {!isRunning && !report && (
        <div className="max-w-xl mx-auto text-center py-20 space-y-6">
          <div className="flex justify-center">
            <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
              <SparklesIcon className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">AI Research Terminal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Orchestrate our multi-agent model to execute security audits.</p>
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('enterTicker')} 
              value={ticker}
              onChange={(e) => { setTicker(e.target.value); setShowSuggestions(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRunResearch(); }}
              className="w-full glass-input pl-12 pr-4 py-3 text-sm shadow-md"
            />
            {/* suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 glass-panel p-2 shadow-lg text-left max-h-56 overflow-y-auto z-50">
                {suggestions.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleRunResearch(s.ticker)}
                    className="flex justify-between items-center w-full px-3 py-2 text-xs font-semibold hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <span>{s.ticker}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick links shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-4">
            <span className="text-slate-400">Popular Tickers:</span>
            {['AAPL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'].map(t => (
              <button 
                key={t}
                onClick={() => handleRunResearch(t)}
                className="bg-slate-200/50 dark:bg-slate-800/50 hover:bg-brand-500/10 hover:text-brand-500 px-3 py-1 rounded-full font-mono text-[10px] font-bold border border-slate-300/30 dark:border-slate-800/30 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Running Progress node screen */}
      {isRunning && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4 mb-4">
              <span className="text-xs font-semibold text-slate-400">Agent Network Orchestrator: <span className="font-mono text-brand-500">{ticker}</span></span>
              <span className="flex items-center gap-1 text-[10px] bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-lg font-bold"><SparklesIcon className="w-3.5 h-3.5" /> Core Graph Running</span>
            </div>

            {/* Vertical Steps */}
            <div className="space-y-4 my-6">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                      step.status === 'completed' 
                        ? 'bg-emerald-500 text-white border-emerald-500' 
                        : (step.status === 'running' ? 'bg-brand-500 text-white border-brand-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700')
                    }`}>
                      {step.status === 'completed' ? <CheckIcon className="w-4 h-4" /> : step.id}
                    </div>
                    {step.id < 7 && <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-800 mt-1" />}
                  </div>
                  <div>
                    <h5 className={`text-xs font-extrabold ${step.status === 'running' ? 'text-brand-500' : 'text-slate-700 dark:text-slate-300'}`}>{step.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.log || 'Awaiting queue position...'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="glass-panel bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col h-48">
            <span className="text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-2 mb-2 uppercase tracking-widest font-bold">Live Execution Logs</span>
            <div ref={logTerminalRef} className="flex-grow overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1.5 scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finished report rendering */}
      {report && (
        <div className="space-y-6">
          {/* Header metadata row */}
          <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-brand-500/10 shadow-lg">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equity Audit Report</span>
              <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 mt-1">{report.profile.companyName} <span className="font-mono text-brand-500">({report.profile.ticker})</span></h1>
              <p className="text-xs text-slate-400 mt-1">Compiled in {steps.length > 0 ? 'Local dual-mode engine' : 'LangGraph network'}.</p>
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
                  onClick={saveReportToDashboard}
                  className="p-2.5 glass-panel hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-brand-500"
                  disabled={isSaved}
                  title="Save Report to Library"
                >
                  {isSaved ? <CheckIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                </button>
                <a 
                  href={`${API_BASE_URL}/report/${reportId}/pdf?token=${localStorage.getItem('token')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 glass-panel hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
                  title="Download PDF Report"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => handleRunResearch(report.profile.ticker)}
                  className="p-2.5 glass-panel hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600"
                  title="Re-run Analysis"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
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

                {/* Data Table */}
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">Synthesized risk rating category: <span className="font-bold text-brand-500">{report.risks.riskRating}</span></p>
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
      )}

    </div>
  );
};

export default ResearchWorkspace;



