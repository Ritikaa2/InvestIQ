import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  CpuChipIcon, 
  ShieldCheckIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  
  // Custom typing animation state
  const typingWords = [
    'Institutional Equity Research', 
    'Multi-Agent SWOT Audits', 
    'Automated Financial Modeling', 
    'Real-Time News Sentiment'
  ];
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typingWords[currentWordIdx];
    let timer;
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayedText(prev => prev.slice(0, -1));
      }, 40);
    } else {
      timer = setTimeout(() => {
        setDisplayedText(currentWord.slice(0, displayedText.length + 1));
      }, 80);
    }

    if (!isDeleting && displayedText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setCurrentWordIdx(prev => (prev + 1) % typingWords.length);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentWordIdx]);

  const faqs = [
    { q: 'How does the LangGraph multi-agent network work?', a: 'InvestIQ routes your query through 7 specialized AI agents (Research, Finance, News, Competitors, SWOT, Risk, and Decision). Each agent processes findings and feeds structured data to the next node in the state graph, producing a compiled institutional report.' },
    { q: 'What database and financial APIs do you use?', a: 'We compile fundamental balance sheets and income reports through Yahoo Finance and AlphaVantage, scan global headlines using News API and Tavily Search, and use cached databases to protect you from API rate limits.' },
    { q: 'Can I export PDF reports directly to my local drive?', a: 'Yes! The report dashboard features a high-fidelity PDF export function that packages all profiles, multi-year finance tables, competitor grids, and decision rationales into an A4 print-ready PDF document.' }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you, ${formData.name}! Message received. We will follow up shortly.`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Sticky Premium Navbar */}
      <nav className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-900/60 h-16 flex items-center justify-between px-6 md:px-12 z-50 transition-colors duration-300">
        <div 
          className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer hover:opacity-90 transition-opacity" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          InvestIQ
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-lg transition-all active:scale-95 duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold mb-8 border border-indigo-500/20 dark:border-indigo-500/30 tracking-wide uppercase"
        >
          <SparklesIcon className="w-4 h-4 animate-spin-slow" />
          Next-Gen AI Orchestrator
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] mb-6 text-slate-900 dark:text-white">
          Autonomous Investment Audits Powered by{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            LangGraph
          </span>
        </h1>

        {/* Dynamic Subhead */}
        <div className="h-8 mb-10 text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center">
          <span>{displayedText}</span>
          <span className="w-1 h-5 bg-indigo-500 ml-2 animate-pulse" />
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto px-4">
          <button 
            onClick={() => navigate('/register')} 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 duration-200"
          >
            Create Free Account <ArrowRightIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold px-8 py-4 rounded-xl transition-all border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-200"
          >
            Sign In to Dashboard
          </button>
        </div>

        {/* Real-time Interactive Terminal Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-4xl bg-white dark:bg-slate-900/60 backdrop-blur-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl relative group"
        >
          <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <span className="text-xs text-slate-400 ml-2 font-mono tracking-tight select-none">analytics_workspace.py</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">v2.4-live</span>
          </div>
          
          <div className="bg-slate-950 rounded-xl overflow-hidden p-6 aspect-video flex flex-col justify-between text-left text-white border border-slate-800/80 shadow-inner">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-black">Live Orchestration Node</span>
                <h3 className="text-3xl font-bold tracking-tight mt-1 text-white">Apple Inc. (AAPL)</h3>
              </div>
              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black rounded-full tracking-wide uppercase shadow-sm">
                BUY • Score: 88/100
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-auto py-6">
              {[
                { label: 'Market Cap', value: '$3.20 Trillion', color: 'text-white' },
                { label: 'P/E Ratio', value: '28.5x', color: 'text-white' },
                { label: 'Revenue Growth', value: '+8.2% Y/Y', color: 'text-white' },
                { label: 'Sentiment Metric', value: '82% Bullish', color: 'text-emerald-400' }
              ].map((metric, i) => (
                <div key={i} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">{metric.label}</div>
                  <div className={`text-xl font-bold mt-1.5 tracking-tight ${metric.color}`}>{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-900/80 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2 text-slate-300">
                <CpuChipIcon className="w-4 h-4 text-indigo-400 animate-pulse" /> 
                Multi-agent state machine graph execution completed safely.
              </span>
              <span className="text-[11px] text-indigo-400/80 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">Latency: 3.22s</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Advanced Agent Grid Flow Section */}
      <section className="py-24 bg-white dark:bg-slate-900/20 border-y border-slate-200/60 dark:border-slate-900/60 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">The LangGraph Workflow Layers</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base">
              See how architectural user input pipelines cascade down through 7 specialized agents to form high-conviction insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {[
              { num: '01', title: 'Research Agent', desc: 'Queries Tavily and secure distributed networks to aggregate financial summaries, structural corporate overviews, and deep operational footprints.' },
              { num: '02', title: 'Finance Specialist', desc: 'Ingests deep balance sheets, normalizing basic P/E configurations, margin values, cash flows, and balance leverage layers.' },
              { num: '03', title: 'News Sentiment Node', desc: 'Scans real-time news engines, cross-referencing global sentiment vectors to output an aggregate trend factor weight.' },
              { num: '04', title: 'Competitor Engine', desc: 'Maps comparative company structures against operational peer metrics, isolating strategic advantages.' },
              { num: '05', title: 'SWOT Auditor', desc: 'Synthesizes quantitative metrics and qualitative indicators directly into an immutable matrix of system attributes.' },
              { num: '06', title: 'Risk Governance Board', desc: 'Evaluates global business vectors, parsing multi-layer technological disruptions and shifts in regulatory trends.' },
              { num: '07', title: 'Final Decision Executive', desc: 'Synthesizes clear Buy/Hold/Pass recommendations, outlining detailed algorithmic justifications.' }
            ].map((step, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 group ${
                  idx === 6 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono font-bold tracking-widest text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20 px-2.5 py-1 rounded-md">
                    STAGE {step.num}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
                </div>
                <h4 className="text-lg font-bold mb-2 tracking-tight text-slate-800 dark:text-slate-100">{step.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Models */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Predictable Premium Pricing</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base">Select the tier optimized for your processing volume and investment footprint.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {[
            { plan: 'Free Tier', price: '$0', desc: 'Designed for individual retail traders exploring automation.', features: ['5 stock analyses per day', 'Local system state persistence', 'Standard high-fidelity PDF outputs', 'Fundamental sentiment indexing'] },
            { plan: 'Pro Analyst', price: '$49', desc: 'Optimized for active traders seeking unrestricted engine power.', features: ['Unlimited real-time queries', 'Unrestricted LangGraph node runs', 'Complete competitive matrix loops', 'Granular token usage summaries', 'Priority technical support'], recommended: true },
            { plan: 'Institutional', price: '$199', desc: 'Engineered for asset managers and distributed venture teams.', features: ['Multi-seat unified organization workspace', 'White-labeled PDF reporting layouts', 'Unrestricted systemic lookup frequencies', 'Dedicated API connection infrastructure', '24/7 designated solutions architect'] }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className={`p-8 rounded-2xl bg-white dark:bg-slate-900/40 border flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1 ${
                card.recommended 
                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/50' 
                  : 'border-slate-200/80 dark:border-slate-800/80 shadow-sm'
              }`}
            >
              {card.recommended && (
                <span className="absolute -top-3 left-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{card.plan}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400/80 mt-2 min-h-[32px]">{card.desc}</p>
                <div className="my-8 flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">{card.price}</span>
                  <span className="text-sm font-medium text-slate-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 border-t border-slate-100 dark:border-slate-800/60 pt-6">
                  {card.features.map((f, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400 stroke-[3]" />
                      </div>
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => navigate('/register')}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] ${
                  card.recommended 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                Choose {card.plan}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced FAQ Accordion */}
      <section className="py-24 bg-white dark:bg-slate-900/20 border-t border-slate-200/60 dark:border-slate-900/60 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-center mb-16 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden transition-all duration-200">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex items-center justify-between w-full p-5 text-left font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors gap-4"
                  >
                    <span className="text-sm md:text-base tracking-tight">{faq.q}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="border-t border-slate-200/60 dark:border-slate-800/60 p-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-white/40 dark:bg-transparent">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Optimized Secure Contact Section */}
      <section className="py-24 px-6 max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">Get in Touch</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Have structural scaling questions? Message our systems team directly.</p>
        </div>

        <form onSubmit={handleContactSubmit} className="bg-white dark:bg-slate-900/40 p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl rounded-2xl space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-2 text-slate-400 dark:text-slate-500">Full Name</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-11 pr-4 py-3 text-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-2 text-slate-400 dark:text-slate-500">Email Address</label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="john@example.com" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-11 pr-4 py-3 text-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-2 text-slate-400 dark:text-slate-500">Message Description</label>
            <div className="relative">
              <ChatBubbleLeftRightIcon className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
              <textarea 
                rows={4} 
                required 
                value={formData.message}
                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                placeholder="Tell us how we can help..." 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-11 pr-4 py-3 text-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none resize-none" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-950 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm tracking-wide shadow-md transition-all active:scale-[0.99]"
          >
            Submit Message
          </button>
        </form>
      </section>

      {/* Minimalist Corporate Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-12 text-center text-xs text-slate-400 font-medium bg-white dark:bg-slate-950">
        <div className="mb-4 text-base font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          InvestIQ
        </div>
        <p>&copy; {new Date().getFullYear()} InvestIQ Technologies Inc. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;