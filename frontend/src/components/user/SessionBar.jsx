import React, { useState, useEffect } from 'react';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export function useSessionTimer() {
  const { sessionExpiry } = useAuth();
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!sessionExpiry) return;
    const tick = () => {
      const ms = sessionExpiry - Date.now();
      setRemaining(ms > 0 ? ms : 0);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [sessionExpiry]);

  if (!remaining) return null;

  const hours   = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const pct     = Math.round((remaining / (5 * 3_600_000)) * 100);
  const isWarning = remaining < 30 * 60 * 1000;

  return { hours, minutes, pct, isWarning, remaining };
}

export default function SessionBar() {
  const timer = useSessionTimer();
  if (!timer) return null;

  const { hours, minutes, pct, isWarning } = timer;
  const color = isWarning ? 'var(--red)' : 'var(--amber)';

  return (
    <div className="session-bar flex items-center gap-3 mb-5"
      style={{ borderColor: `${color}33`, background: `${color}08` }}>
      {isWarning
        ? <FiAlertTriangle size={15} style={{ color, flexShrink: 0 }}/>
        : <FiClock size={15} style={{ color, flexShrink: 0 }}/>
      }
      <span className="text-xs flex-1" style={{ color }}>
        {isWarning ? 'Session expiring soon — ' : 'Session active — '}
        auto logout in <strong>{hours}h {minutes}m</strong>
      </span>
      <div style={{ width: 100, height: 4, background: 'var(--bg-surface-3)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s' }}/>
      </div>
    </div>
  );
}
