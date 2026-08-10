import React, { useState } from 'react';
import { Sparkles, X, Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Staff Data Engineer');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userProfile = {
      name: name || (isSignUp ? 'New Platform Engineer' : 'Mayank Parashar'),
      email: email || 'mayank@fictionretail.com',
      role: role || 'Lead Analytics Engineer'
    };
    onLoginSuccess(userProfile);
    onClose();
  };

  const handleQuickDemoLogin = (demoRole: string) => {
    const userProfile = {
      name: 'Mayank Parashar',
      email: 'mayank@fictionretail.com',
      role: demoRole
    };
    onLoginSuccess(userProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-md">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-sans">
                DataHub <span className="text-sky-600 font-mono">dbt Forge</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isSignUp ? 'Create your platform account' : 'Sign in to access workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Sign In Shortcut */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quick Demo Sign In
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">1-Click</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('Lead Analytics Engineer')}
              className="text-xs bg-white hover:bg-slate-100 text-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-200 shadow-sm transition text-left"
            >
              👩‍💻 Analytics Engineer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('Data Platform Manager')}
              className="text-xs bg-white hover:bg-slate-100 text-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-200 shadow-sm transition text-left"
            >
              👨‍💼 Platform Manager
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400">Or email sign in</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {isSignUp && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mayank Parashar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mayank@fictionretail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Role Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="Lead Analytics Engineer">Lead Analytics Engineer</option>
                  <option value="Staff Data Platform Engineer">Staff Data Platform Engineer</option>
                  <option value="Head of Data Governance">Head of Data Governance</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 text-xs"
          >
            <span>{isSignUp ? 'Create Platform Account' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </form>

        {/* Toggle Login / Sign Up */}
        <div className="text-center text-xs text-slate-500 font-medium">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button onClick={() => setIsSignUp(false)} className="text-sky-600 font-bold hover:underline">
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a platform account?{' '}
              <button onClick={() => setIsSignUp(true)} className="text-sky-600 font-bold hover:underline">
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
