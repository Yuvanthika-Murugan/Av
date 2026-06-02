import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages - Auth
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages - User
import UserLayout from './components/layout/UserLayout';
import Dashboard from './pages/user/Dashboard';
import Feed from './pages/user/Feed';
import CreatePost from './pages/user/CreatePost';
import Profile from './pages/user/Profile';
import Notifications from './pages/user/Notifications';
import EditPost from './pages/user/EditPost';

// Pages - Admin
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts from './pages/admin/AdminPosts';
import AdminUsers from './pages/admin/AdminUsers';
import ActivityLogs from './pages/admin/ActivityLogs';

// Pages - Common
import NotFound from './pages/NotFound';

import './styles/index.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--neon)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading FreelanceHub...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--bg-surface-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13.5px',
                fontFamily: 'DM Sans, sans-serif'
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* User routes */}
            <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="feed" element={<Feed />} />
              <Route path="create-post" element={<CreatePost />} />
              <Route path="edit-post/:id" element={<EditPost />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="feed" element={<Feed />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
