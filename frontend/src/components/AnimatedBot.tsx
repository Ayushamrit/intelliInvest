import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedBotProps {
  state: 'idle' | 'thinking' | 'invest' | 'pass';
}

const AnimatedBot: React.FC<AnimatedBotProps> = ({ state }) => {
  return (
    <div className="bot-container">
      {/* Background effect rings */}
      <AnimatePresence>
        {state === 'invest' && (
          <>
            <div className="bot-radar-ring" />
            <div className="bot-radar-ring" />
            <div className="bot-radar-ring" />
          </>
        )}
        {state === 'pass' && (
          <>
            <div className="bot-pass-ring" />
            <div className="bot-pass-ring" />
            <div className="bot-pass-ring" />
          </>
        )}
        {state === 'thinking' && (
          <div className="bot-orbit">
            <div className="bot-orbit-dot" />
            <div className="bot-orbit-dot" />
            <div className="bot-orbit-dot" />
          </div>
        )}
      </AnimatePresence>

      {/* Main Bot Body */}
      <motion.div
        className={`bot-body bot-state-${state}`}
        animate={
          state === 'idle'
            ? { y: [0, -6, 0] }
            : state === 'thinking'
            ? { y: [0, -3, 0], rotate: [-1, 1, -1] }
            : state === 'invest'
            ? { y: [0, -10, 0], scale: [1, 1.05, 1] }
            : { y: [0, -4, 0], rotate: [-2, 2, -2] }
        }
        transition={{
          duration: state === 'thinking' ? 0.8 : state === 'invest' ? 1.2 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="bot-head">
          <div className="bot-antenna" />
          <div className="bot-ears left" />
          <div className="bot-ears right" />

          {/* Eyes */}
          <div className="bot-eye left">
            <div className="bot-eye-pupil" />
          </div>
          <div className="bot-eye right">
            <div className="bot-eye-pupil" />
          </div>

          {/* Mouth */}
          <motion.div
            className="bot-mouth"
            animate={
              state === 'invest'
                ? { width: [30, 38, 30], height: [6, 8, 6], borderRadius: ['3px', '0 0 8px 8px', '3px'] }
                : state === 'pass'
                ? { y: [0, 3, 0], width: [30, 22, 30] }
                : state === 'thinking'
                ? { opacity: [0.6, 1, 0.6] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                state === 'invest'
                  ? 'rgba(16, 185, 129, 0.7)'
                  : state === 'pass'
                  ? 'rgba(244, 63, 94, 0.7)'
                  : 'rgba(99, 102, 241, 0.6)',
            }}
          />
        </div>
      </motion.div>

      {/* Status label */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          marginTop: '10px',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:
            state === 'invest'
              ? '#34d399'
              : state === 'pass'
              ? '#fb7185'
              : state === 'thinking'
              ? '#818cf8'
              : '#8888aa',
        }}
      >
        {state === 'thinking'
          ? 'Analyzing...'
          : state === 'invest'
          ? '✓ Strong Buy'
          : state === 'pass'
          ? '✗ Avoid'
          : 'Awaiting Signal'}
      </motion.div>
    </div>
  );
};

export default AnimatedBot;
