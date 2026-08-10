import React from 'react';
import { WritebackResult } from '../types';
import { CheckCircle2, GitCommit, Tag, FileText, X } from 'lucide-react';

interface DataHubWritebackModalProps {
  result: WritebackResult;
  onClose: () => void;
}

export const DataHubWritebackModal: React.FC<DataHubWritebackModalProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-2xl border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Published to DataHub</h3>
              <p className="text-xs text-slate-400">Closed-loop metadata & lineage registration complete</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-mono font-bold text-[10px]">Registered Dataset URN:</span>
            <div className="font-mono text-cyan-400 font-bold bg-slate-900 p-2.5 rounded-xl mt-1 break-all border border-slate-700">
              {result.dataset_urn}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-700/60 pt-2.5 text-slate-300">
            <span className="flex items-center space-x-1.5 font-semibold">
              <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upstream Lineage Linked:</span>
            </span>
            <span className="font-mono font-bold text-white">{result.lineage_added.length} asset(s)</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-700/60 pt-2.5 text-slate-300">
            <span className="flex items-center space-x-1.5 font-semibold">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Metadata Tags Ingested:</span>
            </span>
            <div className="flex space-x-1">
              {result.tags_added.map(t => (
                <span key={t} className="bg-slate-700 text-slate-200 border border-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-700/60 pt-2.5 text-slate-300">
            <span className="flex items-center space-x-1.5 font-semibold">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Documentation Ingested:</span>
            </span>
            <span className="text-emerald-400 font-bold font-mono">Updated README Aspect</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
        >
          Done
        </button>
      </div>
    </div>
  );
};
