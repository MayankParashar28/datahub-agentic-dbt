import React from 'react';
import { Database, ShieldCheck, Tag, ArrowRight, Sparkles } from 'lucide-react';

interface CatalogExplorerProps {
  datasets: { urn: string; name: string; platform: string; description?: string; domain?: string }[];
  onSelectDataset: (urn: string) => void;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({ datasets, onSelectDataset }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Database className="w-4 h-4" />
            <span>DataHub Enterprise Catalog Explorer</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Fictional Retail Platform Metadata Catalog (`fiction-retail`)</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            Explore 7 registered PostgreSQL & analytical cohort datasets normalized from DataHub GMS. Select any asset to trigger automated dbt model and test generation.
          </p>
        </div>
        <span className="bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-xs px-4 py-2 rounded-2xl font-bold">
          {datasets.length} Active Catalog Assets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((ds) => (
          <div
            key={ds.urn}
            onClick={() => onSelectDataset(ds.urn)}
            className="bg-white border border-slate-200 hover:border-sky-500 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {ds.platform}
                </span>
                <span className="text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-mono">
                  Inspect <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 font-mono group-hover:text-sky-600 transition-colors">
                {ds.name}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                {ds.description || 'No catalog description provided in DataHub.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {ds.domain || 'General'}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified URN
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
