import React, { useEffect, useState } from 'react';
import { X, Clock, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

interface HistoryModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: any) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ token, isOpen, onClose, onSelectReport }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setHistory(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} style={{ color: '#818cf8' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Research History</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{history.length} past reports</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '0.4rem' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Divider */}
          <hr className="divider" style={{ margin: '0 0 1rem' }} />

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Loading reports...</p>
              </div>
            ) : history.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem', lineHeight: 1.6 }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                <p style={{ fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>No reports yet</p>
                <p style={{ fontSize: '0.8rem' }}>Search for a stock to generate your first AI report.</p>
              </motion.div>
            ) : (
              history.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    onSelectReport(report);
                    onClose();
                  }}
                  className="history-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: report.decision === 'Invest'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : 'rgba(244, 63, 94, 0.12)',
                      border: `1px solid ${report.decision === 'Invest' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {report.decision === 'Invest'
                        ? <TrendingUp size={16} style={{ color: '#34d399' }} />
                        : <TrendingDown size={16} style={{ color: '#fb7185' }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.companyName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' • '}
                        <span style={{
                          color: report.decision === 'Invest' ? '#34d399' : '#fb7185',
                          fontWeight: 700,
                        }}>
                          {report.decision === 'Invest' ? '🚀 BUY' : '🔴 AVOID'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HistoryModal;
