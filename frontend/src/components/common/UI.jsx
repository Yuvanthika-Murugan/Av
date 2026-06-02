import React from 'react';
import { motion } from 'framer-motion';

// ─── PAGE HEADER ───
export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-20"
    style={{ background: 'var(--header-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
    <div>
      <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);

// ─── STAT CARD ───
export const StatCard = ({ label, value, change, changeType = 'up', icon: Icon, accent = 'blue' }) => {
  const accents = { blue: 'var(--neon)', green: 'var(--green)', amber: 'var(--amber)', purple: 'var(--purple)', red: 'var(--red)' };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="surface-card p-4 relative overflow-hidden"
      style={{ borderTop: `2px solid ${accents[accent]}` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{value}</p>
          {change && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: changeType === 'up' ? 'var(--green)' : 'var(--text-muted)' }}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accents[accent]}18`, color: accents[accent] }}>
            <Icon size={18}/>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── BUTTON ───
export const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, onClick, className = '', type = 'button', ...props }) => {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'btn-neon',
    ghost: 'btn-ghost',
    danger: 'text-red-400 border border-red-400/30 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-all',
    success: 'text-green-400 border border-green-400/30 bg-green-400/10 hover:bg-green-400/20 rounded-lg transition-all'
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${variants[variant]} ${sizes[size]} inline-flex items-center gap-1.5 font-medium font-body ${className}`} {...props}>
      {loading ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"/> : null}
      {children}
    </button>
  );
};

// ─── INPUT ───
export const Input = ({ label, error, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
    <input className="input-field" {...props}/>
    {error && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{error}</p>}
  </div>
);

// ─── SELECT ───
export const Select = ({ label, children, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
    <select className="input-field" style={{ cursor: 'pointer' }} {...props}>{children}</select>
  </div>
);

// ─── TEXTAREA ───
export const Textarea = ({ label, error, rows = 4, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
    <textarea rows={rows} className="input-field resize-none" {...props}/>
    {error && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{error}</p>}
  </div>
);

// ─── BADGE ───
export const Badge = ({ status, children }) => (
  <span className={`badge badge-${status}`}>{children || status}</span>
);

// ─── AVATAR ───
export const Avatar = ({ name, src, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`}/>;
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg, var(--neon), var(--purple))' }}>{initials}</div>
  );
};

// ─── CARD ───
export const Card = ({ children, className = '', padding = true }) => (
  <div className={`surface-card ${padding ? 'p-5' : ''} ${className}`}>{children}</div>
);

// ─── SKELETON ───
export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`}/>;

export const PostSkeleton = () => (
  <div className="surface-card overflow-hidden">
    <Skeleton className="h-44 w-full rounded-none"/>
    <div className="p-4 space-y-2">
      <Skeleton className="h-3 w-20"/>
      <Skeleton className="h-4 w-full"/>
      <Skeleton className="h-3 w-3/4"/>
    </div>
  </div>
);

// ─── EMPTY STATE ───
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-16">
    {icon && <div className="text-5xl mb-4" style={{ opacity: 0.3 }}>{icon}</div>}
    <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>
    {action}
  </div>
);

// ─── MODAL ───
export const Modal = ({ isOpen, onClose, title, children, maxWidth = '480px' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>✕</button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// ─── TABLE ───
export const Table = ({ headers, children, loading }) => (
  <div className="overflow-x-auto">
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
    {loading && (
      <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <div className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mb-2"/>
        <div>Loading...</div>
      </div>
    )}
  </div>
);

export const Tr = ({ children, onClick }) => (
  <tr onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}
    className="group transition-colors"
    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    {children}
  </tr>
);

export const Td = ({ children, className = '', bold }) => (
  <td style={{ padding: '11px 14px', fontSize: 13, color: bold ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}
    className={className}>{children}</td>
);
