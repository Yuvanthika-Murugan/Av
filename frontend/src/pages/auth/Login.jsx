import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input } from '../../components/common/UI';

const AuthCard = ({ children, title, subtitle }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)', pointerEvents: 'none' }}/>
    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)', pointerEvents: 'none' }}/>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 36, width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
      <div className="flex items-center gap-2.5 mb-7">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold"
          style={{ background: 'linear-gradient(135deg, var(--neon), var(--purple))' }}>FH</div>
        <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>FreelanceHub</span>
      </div>
      <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      {children}
    </motion.div>
  </div>
);

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) {
      navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account to continue">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="btn-ghost p-1.5 rounded-lg">{isDark?<FiSun size={15}/>:<FiMoon size={15}/>}</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email Address" type="email" placeholder="your@email.com" required autoComplete="email"
          value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}/>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="Your password" required className="input-field pr-10"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}/>
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {showPass ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
            </button>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full justify-center py-2.5 text-base mt-2">
          Sign In
        </Button>

        {/* Demo hint */}
        <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1.5 mb-1"><FiShield size={12} style={{ color: 'var(--purple)' }}/><strong style={{ color: 'var(--purple)' }}>Admin login:</strong></div>
          admin@freelancehub.com / Admin@123456
        </div>
      </form>
      <p className="text-sm text-center mt-5" style={{ color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--neon-light)' }}>Register</Link>
      </p>
      <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>← Back to home</Link>
      </p>
    </AuthCard>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    const res = await register(form.name, form.email, form.mobile, form.password);
    setLoading(false);
    if (res.success) navigate('/login');
  };

  const set = (field) => (e) => setForm(f => ({...f, [field]: e.target.value}));

  return (
    <AuthCard title="Create account" subtitle="Join thousands of top freelancers">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="btn-ghost p-1.5 rounded-lg">{isDark?<FiSun size={15}/>:<FiMoon size={15}/>}</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input label="Full Name" placeholder="Alex Morgan" required value={form.name} onChange={set('name')}/>
        <Input label="Email Address" type="email" placeholder="alex@example.com" required value={form.email} onChange={set('email')}/>
        <Input label="Mobile Number" type="tel" placeholder="+91 9876 543 210" required value={form.mobile} onChange={set('mobile')}/>
        <Input label="Password" type="password" placeholder="Min. 8 characters" required value={form.password} onChange={set('password')}/>
        <Input label="Confirm Password" type="password" placeholder="Repeat password" required value={form.confirm} onChange={set('confirm')}/>
        {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        <Button type="submit" loading={loading} className="w-full justify-center py-2.5 text-base mt-1">
          Create Account
        </Button>
      </form>
      <p className="text-sm text-center mt-5" style={{ color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--neon-light)' }}>Sign In</Link>
      </p>
    </AuthCard>
  );
}

export default Login;
