import React from 'react';
import { Play, RefreshCw, ArrowRight, Server, Globe, GitFork, Sparkles } from 'lucide-react';

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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
        {/* Primary Dataset Select */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-mono font-bold">1</span>
              <span>Primary Source Dataset</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono font-semibold">DataHub Ground Truth</span>
          </div>

          <div className="relative">
            <select
              value={selectedUrn}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 transition cursor-pointer appearance-none shadow-sm"
            >
              {datasets.map((d) => (
                <option key={d.urn} value={d.urn}>
                  {d.name} — {d.platform.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500 text-xs">▼</div>
          </div>
        </div>

        {/* Optional Secondary Join Dataset Select */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-indigo-600 inline" />
              <span>Join Dimension (Optional)</span>
            </label>
            <span className="text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded font-bold">Multi-Table Join</span>
          </div>

          <div className="relative">
            <select
              value={secondaryUrn}
              onChange={(e) => onSelectSecondaryUrn(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer appearance-none shadow-sm"
            >
              <option value="">-- None (Single Table Model) --</option>
              {datasets.filter(d => d.urn !== selectedUrn).map((d) => (
                <option key={d.urn} value={d.urn}>
                  JOIN {d.name} ({d.platform.toUpperCase()})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500 text-xs">▼</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="lg:col-span-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !selectedUrn}
            className={`w-full flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl text-xs font-extrabold tracking-wide shadow-md transition-all duration-200 ${
              isGenerating
                ? 'bg-slate-300 text-slate-600 border border-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-black text-white border border-slate-900 hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Generate dbt Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional Custom Business Rule Prompt */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Custom Business Rule / Engineering Prompt (Optional)</span>
        </label>
        <input
          type="text"
          value={customInstructions}
          onChange={(e) => onChangeCustomInstructions(e.target.value)}
          placeholder="e.g. Derive gross order value, format lower-case email, and filter ACTIVE accounts..."
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition shadow-inner"
        />
      </div>

      {current?.description && (
        <div className="text-xs text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center space-x-2">
          <span className="font-bold text-slate-900 shrink-0">DataHub Description:</span>
          <span className="italic text-slate-700">"{current.description}"</span>
        </div>
      )}
    </div>
  );
};
