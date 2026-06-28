import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Search, ChevronRight, ShieldAlert, Zap, Brain, BarChart3, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBot from '../components/AnimatedBot';
import WatchlistSidebar from '../components/WatchlistSidebar';
import HistoryModal from '../components/HistoryModal';

interface ResearchResult {
  decision: 'Invest' | 'Pass';
  reasoning: string;
  analysis: string;
}

const QUICK_SEARCHES = ['NVIDIA', 'Apple', 'Tesla', 'Microsoft', 'Infosys', 'TCS'];

const NODE_STEPS = [
  { label: 'Researcher', key: 'research' },
  { label: 'Analyst', key: 'analyst' },
  { label: 'Decider', key: 'decider' },
];

const Dashboard = () => {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [botState, setBotState] = useState<'idle' | 'thinking' | 'invest' | 'pass'>('idle');
  const [activeNodeIndex, setActiveNodeIndex] = useState(-1);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  // Simulate node progression during loading
  useEffect(() => {
    if (loading) {
      setActiveNodeIndex(0);
      const t1 = setTimeout(() => setActiveNodeIndex(1), 8000);
      const t2 = setTimeout(() => setActiveNodeIndex(2), 18000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setActiveNodeIndex(-1);
    }
  }, [loading]);

  const handleResearch = async (e?: React.FormEvent, presetCompany?: string) => {
    if (e) e.preventDefault();
    const query = presetCompany || companyName;
    if (!query.trim()) return;

    setCompanyName(query);
    setLoading(true);
    setError('');
    setResult(null);
    setBotState('thinking');

    try {
      const res = await axios.post(
        `${API_URL}/api/research`,
        { companyName: query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      setBotState(res.data.decision.toLowerCase() as 'invest' | 'pass');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during research.');
      setBotState('idle');
    } finally {
      setLoading(false);
    }
  };

  const loadPastReport = (report: any) => {
    setCompanyName(report.companyName);
    setResult({
      decision: report.decision as 'Invest' | 'Pass',
      reasoning: report.reasoning,
      analysis: report.reasoning,
    });
    setBotState(report.decision.toLowerCase() as 'invest' | 'pass');
  };

  return (
    <div className="dashboard-grid">
      {/* ───────── LEFT: WATCHLIST SIDEBAR ───────── */}
      <div className="sidebar-container">
        <WatchlistSidebar token={token} onSearch={(ticker) => handleResearch(undefined, ticker)} />
      </div>

      {/* ───────── RIGHT: MAIN WORKSPACE ───────── */}
      <div className="dashboard-workspace">

        {/* ── TOP STATUS BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
          style={{ padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="status-dot" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#34d399', letterSpacing: '0.05em' }}>
                LangGraph Engine Ready
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="metric-chip blue"><Brain size={11} />Groq Llama 3.3</span>
              <span className="metric-chip cyan"><Zap size={11} />Multi-Agent</span>
              <span className="metric-chip amber"><BarChart3 size={11} />Live Research</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user.name || user.email}</strong>
              </span>
            )}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="quick-action-btn"
            >
              <Clock size={14} />
              Report History
            </button>
          </div>
        </motion.div>

        {/* ── SEARCH + BOT ROW ── */}
        <div className="search-hub-container">

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}
          >
            <div>
              <div className="section-label" style={{ marginBottom: '0.5rem' }}>AI Investment Scanner</div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem', fontWeight: 800 }}>
                Scan Any Stock
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Deploy the 3-node LangGraph intelligence chain to generate institutional-grade investment reports.
              </p>
            </div>

            <form onSubmit={handleResearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ flex: 1, minWidth: '180px' }}>
                <Search size={18} className="search-icon-inside" />
                <input
                  id="stock-search-input"
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem', height: '3rem' }}
                  placeholder="Enter company or ticker (e.g. NVDA, Apple...)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                id="scan-btn"
                type="submit"
                className="btn-primary"
                style={{ height: '3rem', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
                disabled={loading || !companyName.trim()}
              >
                {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : <>Initiate Scan <ChevronRight size={16} /></>}
              </button>
            </form>

            {/* Quick Search Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>Quick:</span>
              {QUICK_SEARCHES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleResearch(undefined, q)}
                  disabled={loading}
                  style={{
                    padding: '0.3rem 0.75rem',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '20px',
                    color: '#818cf8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.background = 'rgba(99,102,241,0.18)';
                    (e.target as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.background = 'rgba(99,102,241,0.08)';
                    (e.target as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  color: '#fb7185',
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                ⚠ {error}
              </motion.div>
            )}
          </motion.div>

          {/* AI Status / Bot Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.25rem' }}
          >
            <div className="section-label" style={{ marginBottom: '0.75rem' }}>Agent Status</div>

            <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatedBot state={botState} />
            </div>

            {/* LangGraph Node Progress */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: '0.75rem', width: '100%' }}
              >
                <div className="loading-bar" style={{ marginBottom: '0.75rem' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  {NODE_STEPS.map((step, i) => (
                    <React.Fragment key={step.key}>
                      <div className="node-step">
                        <div
                          className={`node-dot ${i === activeNodeIndex ? 'active' : i < activeNodeIndex ? 'done' : ''}`}
                        />
                        <span style={{
                          fontSize: '0.6rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: i === activeNodeIndex ? '#818cf8' : i < activeNodeIndex ? '#34d399' : 'var(--text-muted)'
                        }}>
                          {step.label}
                        </span>
                      </div>
                      {i < NODE_STEPS.length - 1 && <span className="node-arrow">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── RESULTS AREA ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-panel"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center', gap: '1rem' }}
            >
              <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                {/* Outer ring */}
                <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(99,102,241,0.15)', borderRadius: '50%', borderTopColor: '#6366f1', animation: 'spin 1.2s linear infinite' }} />
                {/* Inner ring */}
                <div style={{ position: 'absolute', inset: '8px', border: '2px solid rgba(168,85,247,0.15)', borderRadius: '50%', borderTopColor: '#a855f7', animation: 'spin-reverse 0.8s linear infinite' }} />
                {/* Center dot */}
                <div style={{ position: 'absolute', inset: '20px', background: 'radial-gradient(circle, #818cf8, #6366f1)', borderRadius: '50%', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>Executing Intelligence Chain</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#818cf8' }}>WebResearcher</span>
                  {' → '}
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#c084fc' }}>FinancialAnalyst</span>
                  {' → '}
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#22d3ee' }}>PortfolioDecider</span>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>This usually takes 20–60 seconds</p>
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* ── Verdict Banner ── */}
              <div className={`verdict-banner ${result.decision === 'Invest' ? 'invest-banner' : 'pass-banner'}`}>
                <div>
                  <div className="section-label" style={{ marginBottom: '0.4rem' }}>AI Investment Verdict</div>
                  <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>{companyName}</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Generated by LangGraph Multi-Agent Chain • Powered by Groq Llama 3.3
                  </p>
                </div>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className={`verdict-badge ${result.decision === 'Invest' ? 'buy' : 'avoid'}`}
                  style={{ flexShrink: 0, fontSize: '1rem', padding: '0.75rem 1.75rem' }}
                >
                  {result.decision === 'Invest' ? '🚀 BUY / LONG' : '🔴 AVOID / SHORT'}
                </motion.div>
              </div>

              {/* ── Details Grid ── */}
              <div className="split-grid">

                {/* Portfolio Manager Reasoning */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass-panel"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={16} style={{ color: result.decision === 'Invest' ? '#34d399' : '#fb7185' }} />
                    Portfolio Manager Reasoning
                  </h3>
                  <div style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.7',
                    color: 'var(--text-primary)',
                    flex: 1,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {result.reasoning}
                  </div>
                </motion.div>

                {/* Analyst Raw Research */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="glass-panel"
                  style={{ display: 'flex', flexDirection: 'column', background: 'rgba(8, 8, 14, 0.85)' }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px #818cf8', display: 'inline-block', flexShrink: 0 }} />
                    Analyst Research Notes
                    <span className="metric-chip blue" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>RAW OUTPUT</span>
                  </h3>
                  <div className="report-terminal">
                    {result.analysis}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── EMPTY STATE ── */}
        {!loading && !result && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel"
            style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--text-muted)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ready to Analyze</h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
              Enter a company name or stock ticker above to launch the AI research pipeline. Results will appear here.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── HISTORY MODAL ── */}
      <HistoryModal
        token={token}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={loadPastReport}
      />
    </div>
  );
};

export default Dashboard;
