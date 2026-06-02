import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="font-display font-bold text-8xl gradient-text mb-4">404</div>
        <h1 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist or was moved.</p>
        <Link to="/" className="btn-neon">← Back to Home</Link>
      </div>
    </div>
  );
}
