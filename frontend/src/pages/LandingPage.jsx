import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  CpuChipIcon, 
  ChartPieIcon, 
  DocumentArrowDownIcon, 
  ShieldCheckIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Custom typing animation state
  const typingWords = ['Institutional Equity Research', 'Multi-Agent SWOT Audits', 'Automated Financial Modeling', 'Real-Time News Sentiment'];
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentWord = typingWords[currentWordIdx];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayedText(prev => prev.slice(0, -1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setDisplayedText(currentWord.slice(0, displayedText.length + 1));
      }, 100);
    }

    if (!isDeleting && displayedText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
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

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen overflow-x-hidden">
      
      {/* Sticky Hero Navbar */}
      <nav className="sticky top-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50 h-16 flex items-center justify-between px-8 z-50">
        <div className="text-xl font-display font-extrabold bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          InvestIQ
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-brand-500 transition-colors">Log In</button>
          <button onClick={() => navigate('/register')} className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-500/10">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-8 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-full text-xs font-semibold mb-6 border border-brand-500/20"
        >
          <SparklesIcon className="w-4 h-4 animate-pulse" />
          Next-Gen AI Orchestrator
        </motion.div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Autonomous Investment Audits Powered by{' '}
          <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            LangGraph
          </span>
        </h1>

        {/* Typing Subhead */}
        <div className="h-8 mb-8 text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center">
          <span>{displayedText}</span>
          <span className="w-1.5 h-5 bg-brand-500 ml-1.5 animate-pulse" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button 
            onClick={() => navigate('/register')} 
            className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 transform hover:-translate-y-0.5"
          >
            Create Free Account <ArrowRightIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="glass-panel hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 font-semibold px-8 py-3.5 rounded-xl transition-all"
          >
            Sign In to Dashboard
          </button>
        </div>

        {/* Floating Mock UI dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-4xl glass-panel p-3 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-2xl relative"
        >
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200/40 dark:border-slate-800/40 mb-3">
            <div className="w-3 h-3 bg-red-500/80 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
            <div className="w-3 h-3 bg-green-500/80 rounded-full" />
            <span className="text-[10px] text-slate-400 ml-2 font-mono">http://investiq.saas/dashboard</span>
          </div>
          <div className="bg-slate-900 rounded-xl overflow-hidden p-6 aspect-video flex flex-col justify-between text-left text-white border border-slate-800 shadow-inner">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-brand-400 font-bold">Research workspace</span>
                <h3 className="text-2xl font-display font-semibold mt-1">Apple Inc. (AAPL)</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg">BUY (Score: 88/100)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">Market Cap</div>
                <div className="text-lg font-bold mt-1 text-slate-100">$3.20 Trillion</div>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">P/E Ratio</div>
                <div className="text-lg font-bold mt-1 text-slate-100">28.5x</div>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">Revenue Growth</div>
                <div className="text-lg font-bold mt-1 text-slate-100">+8.2% Y/Y</div>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">Sentiment</div>
                <div className="text-lg font-bold mt-1 text-emerald-400">82% Bullish</div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CpuChipIcon className="w-4 h-4 text-brand-500" /> Multi-Agent state analysis compiled.</span>
              <span className="text-[10px] font-mono">Response Speed: 3.2s</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Workflow Timeline Section */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-900/50 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-extrabold mb-4">Under The Hood: LangGraph Workflow</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">See how your search cascades through 7 distinct autonomous intelligence layers to synthesize raw market metrics into a final decision.</p>
          </div>

          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-32 space-y-12">
            {[
              { title: '1. Research Agent', desc: 'Queries Tavily and local databases to aggregate business summaries, CEO history, headquarters, and core operations.' },
              { title: '2. Finance Agent', desc: 'Queries fundamental balance sheets, calculating P/E ratios, gross and net margins, EPS, debt levels, and historical FCF.' },
              { title: '3. News Sentiment Agent', desc: 'Gathers recent global financial headlines, mapping stories to sentiment metrics and generating a compound score.' },
              { title: '4. Competitor Agent', desc: 'Compares the company against leading industry peers, identifying market share distribution and core advantages/disadvantages.' },
              { title: '5. SWOT Specialist', desc: 'Maps company parameters, financials, and news trends into a complete SWOT analysis grid.' },
              { title: '6. Risk Committee', desc: 'Rates vulnerability to business shifts, regulatory changes, macro-economic conditions, and cyber/technology disruptions.' },
              { title: '7. Final Decision Chair', desc: 'Formulates investment recommendations (Buy/Hold/Pass), confidence levels, justification points, and compiled executive summaries.' }
            ].map((step, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12 group">
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-950 group-hover:bg-brand-500 transition-colors" />
                <div className="absolute -left-20 top-1 text-xs font-mono text-slate-400 hidden md:block">STAGE 0{idx + 1}</div>
                <h4 className="text-lg font-bold mb-1 text-slate-700 dark:text-slate-200">{step.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-extrabold mb-4">Pricing Models</h2>
          <p className="text-slate-500 dark:text-slate-400">Start free, upgrade as your trading portfolio grows.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { plan: 'Free Tier', price: '$0', desc: 'For retail hobbyists getting started.', features: ['5 stock analyses per day', 'Local DB persistence', 'Standard PDF print exports', 'General news sentiment check'] },
            { plan: 'Pro Analyst', price: '$49', desc: 'For active traders and researchers.', features: ['Unlimited searches', 'Active LangGraph API execution', 'Competitor matrix & SWOT overlays', 'Live token usage monitoring', 'Priority email support'], recommended: true },
            { plan: 'Institutional', price: '$199', desc: 'For asset management teams.', features: ['Multi-seat team licenses', 'Custom PDF report branding', 'Unlimited Tavily Search queries', 'Custom API access integrations', 'Dedicated 24/7 account support'] }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className={`glass-panel p-6 border flex flex-col justify-between relative transition-transform duration-300 hover:-translate-y-1 ${
                card.recommended 
                  ? 'border-brand-500/50 shadow-brand-500/5 ring-1 ring-brand-500/30' 
                  : 'border-slate-200/50 dark:border-slate-800/50'
              }`}
            >
              {card.recommended && (
                <span className="absolute -top-3 right-6 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>
              )}
              <div>
                <h3 className="text-xl font-bold font-display">{card.plan}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold font-display">{card.price}</span>
                  <span className="text-sm text-slate-400"> / month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {card.features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-brand-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => navigate('/register')}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  card.recommended 
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/10' 
                    : 'bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                Choose {card.plan}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQS Accordion */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-t border-slate-200/50 dark:border-slate-900/50 px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-extrabold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="flex items-center justify-between w-full p-4 text-left font-semibold text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  {faq.q}
                  <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-slate-200/40 dark:border-slate-800/40 text-xs text-slate-500 dark:text-slate-400 leading-relaxed"
                    >
                      <div className="p-4">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-8 max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-extrabold mb-3">Get in Touch</h2>
          <p className="text-slate-500 dark:text-slate-400">Have questions about integrations or enterprise features?</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('Message received! We will follow up shortly.'); }} className="glass-panel p-6 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" required placeholder="John Doe" className="w-full glass-input pl-10 pr-4 py-2 text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" required placeholder="john@example.com" className="w-full glass-input pl-10 pr-4 py-2 text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Message Description</label>
            <div className="relative">
              <ChatBubbleLeftRightIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea rows={4} required placeholder="Tell us how we can help..." className="w-full glass-input pl-10 pr-4 py-2 text-xs" />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-brand-500/10">
            Submit Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-900 py-10 text-center text-xs text-slate-400">
        <div className="mb-4 text-sm font-semibold font-display bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">InvestIQ</div>
        <p>(c) {new Date().getFullYear()} InvestIQ Technologies Inc. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;



