import React, { useState } from 'react';
import { User, Mail, Lock, KeyRound, ArrowRight, Handshake } from 'lucide-react';

interface SignUpProps {
  onSignUpSuccess: (name: string, email: string, password: string) => Promise<void>;
  onSignInLinkClick: () => void;
}

export default function SignUp({ onSignUpSuccess, onSignInLinkClick }: SignUpProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await onSignUpSuccess(fullName, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-surface-bg overflow-hidden">
      <main className="w-full max-w-[480px] z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl mb-3 text-white">
            <Handshake size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">mini CRM</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Accelerate your sales velocity.</p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
            <p className="text-sm font-medium text-slate-500">Start managing your relationships better today.</p>
            {error && (
              <div className="mt-3 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="full-name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="full-name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="crm-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="crm-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="crm-input pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="confirm-password">
                  Confirm
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound size={18} />
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="crm-input pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4.5 h-4.5 text-primary border-slate-200 rounded focus:ring-primary focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-xs font-medium text-slate-500 leading-normal">
                I agree to the{' '}
                <a href="#terms" className="text-primary hover:underline font-semibold">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-primary hover:underline font-semibold">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <button onClick={onSignInLinkClick} className="text-primary font-bold hover:underline ml-1">
            Log in
          </button>
        </p>
      </main>
    </div>
  );
}
