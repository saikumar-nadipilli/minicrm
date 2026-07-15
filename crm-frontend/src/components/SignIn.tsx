import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Handshake } from 'lucide-react';

interface SignInProps {
  onSignInSuccess: (email: string, password: string) => Promise<void>;
  onSignUpLinkClick: () => void;
}

export default function SignIn({ onSignInSuccess, onSignUpLinkClick }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSignInSuccess(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-surface-bg overflow-hidden">
      <main className="w-full max-w-[960px] z-10 animate-fade-in-up grid lg:grid-cols-[1fr_448px] gap-6 items-stretch">
        <section className="hidden lg:flex rounded-3xl bg-slate-950 text-white p-8 flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white">
              <Handshake size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">mini CRM</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sales Console</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Workspace ready</p>
            <h2 className="mt-3 max-w-md text-4xl font-extrabold leading-tight">Keep every lead, note, and follow-up moving.</h2>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {['Contacts', 'Activity', 'Notes'].map((label) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold">{label}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">Synced</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Handshake size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">mini CRM</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">Log in to your sales command center</p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-150">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="crm-input pl-10 pr-4 py-3 text-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-150">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="crm-input pl-10 pr-12 py-3 text-sm placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-150 p-1 rounded"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 text-primary border-slate-200 rounded focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm font-medium text-slate-500 cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            <div className="flex flex-col gap-3 mt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight size={16} />
              </button>

            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              New to mini CRM?{' '}
              <button onClick={onSignUpLinkClick} className="text-primary font-bold hover:underline ml-1">
                Create an account
              </button>
            </p>
          </div>
        </div>

        <footer className="mt-8 flex justify-center gap-6 text-slate-400 font-medium text-[11px]">
          <a href="#privacy" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-slate-600 transition-colors">
            Terms of Service
          </a>
          <a href="#help" className="hover:text-slate-600 transition-colors">
            Help Center
          </a>
        </footer>
        </section>
      </main>
    </div>
  );
}
