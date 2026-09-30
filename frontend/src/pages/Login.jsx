import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Check } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'login') {
      if (!username.trim() || !password) {
        setError('Please provide both username and password.');
        return;
      }

      setLoading(true);
      const result = await login(username, password);
      setLoading(false);

      if (result.success) {
        // Enforce role-based routing: non-admin users can NEVER access the admin dashboard
        const userIsAdmin = Boolean(
          result.user?.role === 'ADMIN' ||
          result.user?.role === 'ROLE_ADMIN' ||
          result.user?.roles?.some((r) => typeof r === 'string' && r.includes('ADMIN'))
        );

        if (!userIsAdmin) {
          // Standard user accounts are strictly routed to the customer landing page
          navigate('/landing', { replace: true });
        } else {
          // Administrators are routed to their requested admin path or dashboard
          const adminTarget = location.state?.from?.pathname || '/dashboard';
          navigate(adminTarget, { replace: true });
        }
      } else {
        setError(result.message || 'Invalid username or password.');
      }
    } else {
      // Sign Up Validation
      if (!username.trim()) {
        setError('Please choose a username.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      const result = await register(username, email, password);
      setLoading(false);

      if (result.success) {
        // Redirect back to login mode on login page with pre-filled username
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccessMessage(result.message || 'Account created successfully! Please sign in with your credentials.');
      } else {
        setError(result.message || 'Registration failed. Username or email may already be in use.');
      }
    }
  };

  const handleQuickLogin = (user, pass) => {
    setMode('login');
    setUsername(user);
    setPassword(pass);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#f5f5f7]">
      {/* Subtle Ambient Apple Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#1d1d1f]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-black/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Top Status Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-black/8 backdrop-blur-xl shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            <span className="text-xs font-medium text-[#1d1d1f] tracking-wide uppercase">
               IMS OS 27 • Spring Boot 3
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] border border-black/8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f5f5f7] border border-black/8 flex items-center justify-center shadow-xs text-[#1d1d1f]">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-[#86868b] mt-1">
              {mode === 'login'
                ? 'Sign in to access your catalog & account'
                : 'Register a new customer account for shopping & catalog'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-[#f5f5f7] border border-black/5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition ${
                mode === 'login'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMessage('');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition ${
                mode === 'signup'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-[#34c759]/12 border border-[#34c759]/25 text-[#248a3d] text-xs font-semibold flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#ff3b30] text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:border-[#1d1d1f]"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:border-[#1d1d1f]"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:border-[#1d1d1f]"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:border-[#1d1d1f]"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-full font-medium text-sm text-white bg-[#1d1d1f] hover:bg-[#333336] transition-all duration-200 shadow-md shadow-black/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Admin Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials (Clean Text, No Emojis/Icons) */}
          <div className="mt-8 pt-6 border-t border-black/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1d1d1f]" />
                Quick Dev Login
              </span>
              <span className="text-[11px] text-[#86868b] font-mono">PIN: 123456</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('mongkol', '123456')}
                className="px-2.5 py-2.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] border border-black/8 text-xs font-medium text-[#1d1d1f] transition flex flex-col items-center gap-0.5 active:scale-95 shadow-xs hover:shadow-sm"
              >
                <span className="font-semibold text-[#1d1d1f]">Mongkol</span>
                <span className="text-[10px] text-[#86868b]">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('nhazz', '123456')}
                className="px-2.5 py-2.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] border border-black/8 text-xs font-medium text-[#1d1d1f] transition flex flex-col items-center gap-0.5 active:scale-95 shadow-xs hover:shadow-sm"
              >
                <span className="font-semibold text-[#1d1d1f]">Nhazz</span>
                <span className="text-[10px] text-[#86868b]">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '123456')}
                className="px-2.5 py-2.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] border border-black/8 text-xs font-medium text-[#1d1d1f] transition flex flex-col items-center gap-0.5 active:scale-95 shadow-xs hover:shadow-sm"
              >
                <span className="font-semibold text-[#1d1d1f]">Admin</span>
                <span className="text-[10px] text-[#86868b]">SuperAdmin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-[#86868b] mt-6">
          ETEC Spring Boot Final Project • Inventory & POS Control
        </p>
      </div>
    </div>
  );
};

export default Login;
