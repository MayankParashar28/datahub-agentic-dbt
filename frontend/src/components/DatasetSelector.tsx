import React from 'react';
import { Play, RefreshCw, ArrowRight, GitFork, Sparkles, Database } from 'lucide-react';

interface DatasetOption {
  urn: string;
  name: string;
  platform: string;
  description?: string;
  domain?: string;
}

interface DatasetSelectorProps {
  datasets: DatasetOption[];
  selectedUrn: string;
  secondaryUrn: string;
  customInstructions: string;
  onSelectDataset: (urn: string) => void;
  onSelectSecondaryUrn: (urn: string) => void;
  onChangeCustomInstructions: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  selectedUrn,
  secondaryUrn,
  customInstructions,
  onSelectDataset,
  onSelectSecondaryUrn,
  onChangeCustomInstructions,
  onGenerate,
  isGenerating
}) => {
  const current = datasets.find(d => d.urn === selectedUrn);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
        {/* Primary Dataset Select */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Primary Catalog Dataset</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">DataHub Ground Truth</span>
          </div>

          <div className="relative">
            <select
              value={selectedUrn}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:border-cyan-400 transition cursor-pointer appearance-none shadow-inner"
            >
              {datasets.map((d) => (
                <option key={d.urn} value={d.urn} className="bg-slate-900 text-white">
                  {d.name} — {d.platform.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>

        {/* Optional Secondary Join Dataset Select */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-extrabold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-indigo-400 inline" />
              <span>Multi-Table Join (Optional)</span>
            </label>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">Multi-Table Join</span>
          </div>

          <div className="relative">
            <select
              value={secondaryUrn}
              onChange={(e) => onSelectSecondaryUrn(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:border-indigo-400 transition cursor-pointer appearance-none shadow-inner"
            >
              <option value="" className="bg-slate-900 text-white">-- None (Single Table Model) --</option>
              {datasets.filter(d => d.urn !== selectedUrn).map((d) => (
                <option key={d.urn} value={d.urn} className="bg-slate-900 text-white">
                  JOIN {d.name} ({d.platform.toUpperCase()})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="lg:col-span-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !selectedUrn}
            className={`w-full flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-lg transition-all duration-200 ${
              isGenerating
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border border-cyan-400 hover:shadow-cyan-500/25 hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Building...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                <span>Generate dbt Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional Custom Business Rule Prompt */}
      <div className="space-y-1.5 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Custom Engineering Rule / Prompt (Optional)</span>
        </label>
        <input
          type="text"
          value={customInstructions}
          onChange={(e) => onChangeCustomInstructions(e.target.value)}
          placeholder="e.g. Derive gross order value, format lower-case email, and filter ACTIVE accounts..."
          className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-cyan-400 transition shadow-inner placeholder-slate-500"
        />
      </div>

      {current?.description && (
        <div className="text-xs text-slate-300 bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-700/60 flex items-center space-x-2">
          <span className="font-bold text-cyan-400 shrink-0 font-mono">DataHub Description:</span>
          <span className="italic text-slate-300">"{current.description}"</span>
        </div>
      )}
    </div>
  );
};
