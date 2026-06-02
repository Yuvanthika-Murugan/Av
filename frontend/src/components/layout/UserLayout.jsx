import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiGrid, FiList, FiPlusCircle, FiUser, FiBell, FiLogOut, FiSun, FiMoon, FiMenu, FiX, FiSettings } from 'react-icons/fi';

const navItems = [
  { to: '/dashboard',    icon: FiGrid,       label: 'Dashboard'    },
  { to: '/feed',         icon: FiList,       label: 'Feed'         },
  { to: '/create-post',  icon: FiPlusCircle, label: 'Create'       },
  { to: '/notifications',icon: FiBell,       label: 'Activity'     },
  { to: '/profile',      icon: FiUser,       label: 'Profile'      },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        w-56 flex flex-col
        border-r
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', height: '100vh' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--neon), var(--purple))' }}>FH</div>
          <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>FreelanceHub</span>
          <button className="ml-auto md:hidden" onClick={onClose} style={{ color: 'var(--text-muted)' }}><FiX size={18}/></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto px-0">
          <div className="px-4 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Main</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: 'var(--neon)', fontSize: 10 }}>{item.badge}</span>
              )}
            </NavLink>
          ))}

          <div className="px-4 mt-4 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Preferences</div>
          <button onClick={toggleTheme} className="nav-item w-full text-left">
            {isDark ? <FiSun size={16}/> : <FiMoon size={16}/>}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout} className="nav-item w-full text-left" style={{ color: 'var(--red)' }}>
            <FiLogOut size={16}/>
            <span>Sign Out</span>
          </button>
        </nav>

        {/* User pill */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--neon), var(--purple))' }}>{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Freelancer</div>
            </div>
            <FiSettings size={14} style={{ color: 'var(--text-muted)' }}/>
          </div>
        </div>
      </aside>
    </>
  );
};

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {/* Mobile topbar */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-primary)' }}><FiMenu size={20}/></button>
          <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>FreelanceHub</span>
        </div>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.div>
      </main>
      <nav className="mobile-bottom-nav md:hidden">
        <div className="mobile-bottom-inner">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''} ${item.to === '/create-post' ? 'bottom-action' : ''}`}>
              <item.icon size={item.to === '/create-post' ? 24 : 20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
