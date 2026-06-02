import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../utils/api';
import { useSessionTimer } from '../user/SessionBar';
import { FiGrid, FiCheckSquare, FiUsers, FiActivity, FiLogOut, FiSun, FiMoon, FiShield, FiMenu, FiX, FiList, FiClock } from 'react-icons/fi';

const getAdminNav = (pendingPosts) => [
  { to: '/admin',        icon: FiGrid,        label: 'Dashboard',    exact: true },
  { to: '/admin/posts',  icon: FiCheckSquare, label: 'Post Approvals', badge: pendingPosts > 0 ? String(pendingPosts) : null },
  { to: '/admin/feed',   icon: FiList,        label: 'Feed'           },
  { to: '/admin/users',  icon: FiUsers,       label: 'Users'          },
  { to: '/admin/logs',   icon: FiActivity,    label: 'Activity Logs'  },
];

const AdminSessionTimer = () => {
  const timer = useSessionTimer();
  if (!timer) return null;

  const { hours, minutes, pct, isWarning } = timer;
  const color = isWarning ? 'var(--red)' : 'var(--amber)';

  return (
    <div className="mx-3 mb-3 rounded-lg p-3" style={{ background: `${color}0d`, border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color }}>
        <FiClock size={14}/>
        <span>Session: {hours}h {minutes}m</span>
      </div>
      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-3)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.5s' }}/>
      </div>
    </div>
  );
};

const Sidebar = ({ open, onClose, pendingPosts }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const adminNav = getAdminNav(pendingPosts);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose}/>}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-56 flex flex-col transition-transform duration-300 ${open?'translate-x-0':'-translate-x-full md:translate-x-0'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', height: '100vh' }}>

        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
            <FiShield size={16}/>
          </div>
          <div>
            <div className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Admin Panel</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>FreelanceHub</div>
          </div>
          <button className="ml-auto md:hidden" onClick={onClose} style={{ color: 'var(--text-muted)' }}><FiX size={18}/></button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="px-4 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Management</div>
          {adminNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact} onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={16}/>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: 'var(--amber)', fontSize: 10 }}>{item.badge}</span>
              )}
            </NavLink>
          ))}

          <div className="px-4 mt-4 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Settings</div>
          <button onClick={toggleTheme} className="nav-item w-full text-left">
            {isDark ? <FiSun size={16}/> : <FiMoon size={16}/>}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <NavLink to="/dashboard" className="nav-item" style={{ color: 'var(--neon-light)' }}>
            <FiGrid size={16}/><span>User View</span>
          </NavLink>
          <button onClick={async () => { await logout(); navigate('/login'); }} className="nav-item w-full text-left" style={{ color: 'var(--red)' }}>
            <FiLogOut size={16}/><span>Sign Out</span>
          </button>
        </nav>

        <AdminSessionTimer/>

        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>AD</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
              <div className="text-xs" style={{ color: 'var(--purple)' }}>Administrator</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingPosts, setPendingPosts] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const loadPendingPosts = async () => {
      try {
        const res = await adminAPI.getDashboard();
        if (mounted) setPendingPosts(res.data?.stats?.pendingPosts || 0);
      } catch {}
    };
    loadPendingPosts();
    window.addEventListener('pending-posts-updated', loadPendingPosts);
    const interval = setInterval(loadPendingPosts, 30000);
    return () => {
      mounted = false;
      window.removeEventListener('pending-posts-updated', loadPendingPosts);
      clearInterval(interval);
    };
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} pendingPosts={pendingPosts}/>
      <main className="flex-1 overflow-y-auto">
        <div className="flex md:hidden items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-primary)' }}><FiMenu size={20}/></button>
          <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Admin Panel</span>
        </div>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Outlet/>
        </motion.div>
      </main>
    </div>
  );
}
