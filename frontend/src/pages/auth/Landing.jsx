import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiGrid, FiClock, FiStar, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const features = [
  { icon: FiCheckCircle, title: 'Verified Posts',   desc: 'Every post is reviewed by admins before going live, ensuring quality talent.',     color: 'var(--green)' },
  { icon: FiGrid,        title: 'Instagram Feed',   desc: 'Infinite-scroll feed with likes, comments, and category filters.',               color: 'var(--neon)'  },
  { icon: FiClock,       title: 'Secure Sessions',  desc: '5-hour auto-expiring sessions with full activity logs and IP tracking.',         color: 'var(--amber)' },
  { icon: FiShield,      title: 'Admin Moderation', desc: 'Full admin panel for approvals, user management, and blocking.',                 color: 'var(--purple)'},
  { icon: FiUsers,       title: 'Freelancer Profiles', desc: 'Rich profiles with skills, portfolio images, and online status indicators.', color: 'var(--neon)'  },
  { icon: FiStar,        title: 'Role-Based Access','desc': 'Separate user and admin dashboards with protected routes.',                    color: 'var(--amber)' },
];

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="flex items-center gap-3 px-8 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, var(--neon), var(--purple))' }}>FH</div>
        <span className="font-display font-bold text-base flex-1" style={{ color: 'var(--text-primary)' }}>FreelanceHub</span>
        <button onClick={toggleTheme} className="btn-ghost p-2 rounded-lg">
          {isDark ? <FiSun size={16}/> : <FiMoon size={16}/>}
        </button>
        <Link to="/login" className="btn-ghost">Sign In</Link>
        <Link to="/register" className="btn-neon">Get Started</Link>
      </nav>

      {/* Hero */}
      <div className="text-center px-6 pt-20 pb-16 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: 'var(--neon-light)' }}>
            ✦ The premium freelancer platform
          </div>
          <h1 className="font-display font-extrabold text-5xl leading-tight mb-5" style={{ color: 'var(--text-primary)' }}>
            Where Top Freelancers<br/>
            <span className="gradient-text">Get Discovered</span>
          </h1>
          <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Post your skills, build your portfolio, and connect with clients — all inside a beautifully crafted platform with smart approval workflows and real-time moderation.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register" className="btn-neon text-base px-8 py-3 rounded-2xl">
              <FiArrowRight size={18}/> Join Free — It's Open
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-3 rounded-2xl">
              Browse the Feed →
            </Link>
          </div>
          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {[['500+', 'Freelancers'], ['1,200+', 'Posts Published'], ['98%', 'Approval Rate']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-display font-bold text-xl gradient-text">{v}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="px-8 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="surface-card p-6">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}18`, color: f.color }}>
                <f.icon size={20}/>
              </div>
              <h3 className="font-display font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        © 2025 FreelanceHub · Built with React + Node.js + MongoDB
      </div>
    </div>
  );
}
