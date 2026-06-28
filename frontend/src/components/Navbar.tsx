import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="custom-navbar">
      <Link to="/" className="nav-logo">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <TrendingUp size={22} style={{ color: '#818cf8' }} />
        </motion.div>
        <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
          IntelliInvest
        </span>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          color: 'white',
          padding: '0.15rem 0.5rem',
          borderRadius: '20px',
          letterSpacing: '0.05em',
          marginLeft: '0.25rem',
          alignSelf: 'center'
        }}>
          AI
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuthenticated ? (
          <>
            {/* Online Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px' }}>
              <div className="status-dot" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>System Online</span>
            </div>

            {/* User pill */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.email}
                </span>
              </div>
            )}

            <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem' }}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="nav-links">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', marginRight: '0.5rem' }}>
              <Zap size={12} style={{ color: '#818cf8' }} />
              <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#818cf8' }}>LangGraph AI Powered</span>
            </div>
            <Link to="/login" className="nav-link-sec">Log in</Link>
            <Link
              to="/signup"
              className="btn-primary"
              style={{ textDecoration: 'none', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
