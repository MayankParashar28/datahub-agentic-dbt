import React from 'react';
import { Sparkles, FileText, Zap, User, LogOut, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  demoMode: boolean;
  currentUser: { name: string; email: string; role: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenExamples: () => void;
  onSwitchToSentinel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  demoMode,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenExamples,
  onSwitchToSentinel
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-md">
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 font-sans">
                DataHub <span className="text-sky-600 font-mono">dbt Forge</span>
              </h1>
              <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-mono font-bold">
                AI Agent
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Turn DataHub metadata into merge-ready dbt pipelines
            </p>
          </div>
        </div>

        {/* Action Controls & Auth Button */}
        <div className="flex items-center space-x-3">
          {onSwitchToSentinel && (
            <button
              onClick={onSwitchToSentinel}
              className="flex items-center space-x-1.5 text-xs font-mono font-bold bg-[#0B0F19] hover:bg-black text-cyan-400 px-3.5 py-2 rounded-xl border border-cyan-800 shadow-md transition"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>DataSentinel Center</span>
            </button>
          )}

          <button
            onClick={onOpenExamples}
            className="flex items-center space-x-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl border border-slate-300 transition"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Sample Examples</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>{demoMode ? 'DEMO MODE' : 'LIVE DATAHUB'}</span>
          </div>

          {/* User Sign In / Account Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-sm">
              <div className="p-1 bg-sky-500/20 text-sky-400 rounded-lg">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left font-sans">
                <div className="font-extrabold leading-none">{currentUser.name}</div>
                <div className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">{currentUser.role}</div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="text-slate-400 hover:text-white p-1 ml-1 rounded hover:bg-slate-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 text-xs font-extrabold bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl shadow-md transition"
            >
              <User className="w-4 h-4 text-sky-400" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
