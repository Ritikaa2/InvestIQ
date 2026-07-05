import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- useNavigate इम्पोर्ट किया
import { 
  ArrowRight, BarChart3, LineChart, PieChart, TrendingUp, 
  Search, Shield, Zap, Globe, Sparkles, ChevronDown, 
  CheckCircle2, Menu, X, ArrowUpRight
} from 'lucide-react';

// Alpha Theme Constants
const C = {
  bg: '#0B0F17',
  card: '#151B26',
  blue: '#3B82F6',
  cyan: '#06B6D4',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  border: 'rgba(255,255,255,0.06)'
};

export default function LandingPage() {
  const navigate = useNavigate(); // <-- navigate फंक्शन इनिशियलाइज़ किया
  const [openQ, setOpenQ] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-gray-100 relative overflow-hidden font-sans select-none selection:bg-blue-500/30" style={{ backgroundColor: C.bg }}>
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ borderColor: C.border, backgroundColor: 'rgba(11, 15, 23, 0.7)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})` }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white"><span style={{ color: C.blue }}>Alpha</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium transition-colors hover:text-white" style={{ color: C.muted }}>
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* बटन पर useNavigate लगाया */}
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-transform active:scale-95" 
              style={{ background: C.blue }}
            >
              Analyze a Company
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b px-6 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200" style={{ backgroundColor: C.bg, borderColor: C.border }}>
            {['Features', 'Dashboard', 'Pricing', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="text-base font-medium" style={{ color: C.muted }}>
                {item}
              </a>
            ))}
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} 
              className="w-full text-center text-sm font-semibold py-2.5 rounded-lg text-white" 
              style={{ background: C.blue }}
            >
              Analyze a Company
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6 backdrop-blur-md bg-white/5" style={{ borderColor: C.border }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: C.cyan }} />
          <span style={{ color: C.muted }}>Next-Gen Financial Intelligence</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-white">
          Institutional-Grade <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${C.blue}, ${C.cyan})` }}>Equity Research</span> For Everyone.
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: C.muted }}>
          Stop drowning in financial statements.  Alpha transforms complex corporate filings, metrics, and data into clear, actionable investment insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* मुख्य बटन पर useNavigate लगाया */}
          <button 
            onClick={() => navigate('/register')} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-500/10" 
            style={{ background: C.blue }}
          >
            Analyze a Company <ArrowRight className="w-4 h-4" />
          </button>
          <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold border transition-colors bg-white/5 hover:bg-white/10" style={{ borderColor: C.border, color: C.text }}>
            Explore Features
          </a>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-6 pb-24 border-b" style={{ borderColor: C.border }}>
        <p className="text-center text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: C.muted }}>POWERING INTELLIGENT INVESTMENTS WITH ADVANCED METRICS</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-50">
          {['10-K Analysis', 'DCF Valuation', 'Sentiment Scoring', 'Real-time Feeds'].map((text, i) => (
            <div key={i} className="flex items-center gap-2 font-semibold text-sm tracking-wide text-white">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> {text}
            </div>
          ))}
        </div>
      </section>

      {/* Core Value Props (Features) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Engineered For Depth. Built For Speed.</h2>
          <p style={{ color: C.muted }}>Everything you need to evaluate equities, perfectly unified into a high-performance system.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl border transition-all hover:scale-[1.02]" style={{ backgroundColor: C.card, borderColor: C.border }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-blue-500/10" style={{ color: C.blue }}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Granular Financials</h3>
            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>Access perfectly clean income statements, balance sheets, and cash flows dating back a decade with visual breakdown tools.</p>
          </div>

          <div className="p-8 rounded-2xl border transition-all hover:scale-[1.02]" style={{ backgroundColor: C.card, borderColor: C.border }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-cyan-500/10" style={{ color: C.cyan }}>
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Automated DCF Models</h3>
            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>Calculate intrinsic stock values instantly using custom or pre-set Discounted Cash Flow assumptions and sensitivity analysis scripts.</p>
          </div>

          <div className="p-8 rounded-2xl border transition-all hover:scale-[1.02]" style={{ backgroundColor: C.card, borderColor: C.border }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-indigo-500/10" style={{ color: '#6366F1' }}>
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Filing Insights</h3>
            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>Our analysis scans dense 10-K and 10-Q documents to flag dynamic risk factor changes, hidden liabilities, and management changes.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t" style={{ borderColor: C.border }}>
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Where does  Alpha pull its financial data from?", a: "We aggregate high-fidelity institutional market data, directly synced with SEC filings, updated in real time as companies publish their reports." },
            { q: "Can I customize the valuation models?", a: "Yes. Every automated valuation allows full adjustments over assumptions like terminal growth rate, WACC, and revenue multi-stage projection factors." },
            { q: "Is there a trial for the institutional API access?", a: "Absolutely. Our Enterprise tier offers a sandbox API access window. Get in touch with our tech engineering desk for custom key deployments." }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-xl overflow-hidden transition-colors" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <button className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white hover:bg-white/5" onClick={() => setOpenQ(openQ === idx ? null : idx)}>
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openQ === idx ? 'rotate-180' : ''}`} />
              </button>
              {openQ === idx && (
                <div className="px-6 pb-5 pt-1 text-sm leading-relaxed border-t border-white/5" style={{ color: C.muted }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 mb-20 text-center relative rounded-3xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Ready to Out-Research the Market?</h2>
        <p className="max-w-xl mx-auto text-base mb-8" style={{ color: C.muted }}>Create your custom workspace today and spin up institutional quality metrics in milliseconds.</p>
        <button 
          onClick={() => navigate('/register')} 
          className="px-8 py-3.5 rounded-lg font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-500/20" 
          style={{ background: C.blue }}
        >
          Get Started For Free
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: C.border, backgroundColor: '#080C12' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-500">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">InvestIQ Alpha</span>
          </div>
          <p className="text-xs" style={{ color: C.muted }}>&copy; {new Date().getFullYear()} InvestIQ Technologies Inc. All institutional rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}