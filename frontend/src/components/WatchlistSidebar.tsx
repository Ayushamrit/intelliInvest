import React, { useEffect, useState } from 'react';
import { Trash2, TrendingUp, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

interface WatchlistSidebarProps {
  token: string;
  onSearch?: (ticker: string) => void;
}

const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({ token, onSearch }) => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [newTicker, setNewTicker] = useState('');

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`${API_URL}/api/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) fetchWatchlist();
  }, [token]);

  const addTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticker: newTicker.toUpperCase() }),
      });
      if (res.ok) {
        setNewTicker('');
        fetchWatchlist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeTicker = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/watchlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchWatchlist();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={15} style={{ color: '#818cf8' }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>My Watchlist</span>
        <span style={{
          marginLeft: 'auto',
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          color: '#818cf8',
          borderRadius: '12px',
          padding: '0.15rem 0.55rem',
          fontSize: '0.7rem',
          fontWeight: 700,
        }}>
          {watchlist.length}
        </span>
      </div>

      {/* Add ticker form */}
      <form onSubmit={addTicker} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="input-field"
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          placeholder="Add ticker..."
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Watchlist items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
        <AnimatePresence>
          {watchlist.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.05 }}
              className="watchlist-card"
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, cursor: onSearch ? 'pointer' : 'default' }}
                onClick={() => onSearch && onSearch(item.ticker)}
                title={onSearch ? `Analyze ${item.ticker}` : item.ticker}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#818cf8',
                  fontFamily: 'JetBrains Mono, monospace',
                  flexShrink: 0,
                }}>
                  {item.ticker.slice(0, 2)}
                </div>
                <span className="watchlist-ticker">{item.ticker}</span>
                {onSearch && (
                  <Search size={11} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                )}
              </div>
              <button
                onClick={() => removeTicker(item.id)}
                className="btn-ghost"
                style={{ padding: '0.2rem 0.3rem', marginLeft: '0.25rem' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).closest('button')!.style.color = '#fb7185')}
                onMouseLeave={(e) => ((e.target as HTMLElement).closest('button')!.style.color = '')}
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {watchlist.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6 }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
            <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No stocks tracked</p>
            <p style={{ fontSize: '0.75rem' }}>Add a ticker above to start monitoring</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WatchlistSidebar;
