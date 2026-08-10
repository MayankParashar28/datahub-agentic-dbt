import React from 'react';
import { Sparkles, FileText, Zap } from 'lucide-react';

interface HeaderProps {
  demoMode: boolean;
  onOpenExamples: () => void;
}

export const Header: React.FC<HeaderProps> = ({ demoMode, onOpenExamples }) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-md">
            <Sparkles className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                DataHub <span className="text-sky-600 font-mono">dbt Forge</span>
              </h1>
              <span className="text-[11px] bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                AI Agent
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Metadata-aware dbt model & test generation with DataHub write-back
            </p>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenExamples}
            className="flex items-center space-x-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl border border-slate-300 transition shadow-sm"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Pre-built Examples</span>
          </button>

          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl text-emerald-800 text-xs font-mono font-bold">
            <Zap className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{demoMode ? 'DEMO MODE (SNAPSHOTS)' : 'LIVE DATAHUB GMS'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
