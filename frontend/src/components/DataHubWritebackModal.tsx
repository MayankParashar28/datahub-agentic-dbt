import React from 'react';
import { WritebackResult } from '../types';
import { CheckCircle2, GitCommit, Tag, FileText, X } from 'lucide-react';

interface DataHubWritebackModalProps {
  result: WritebackResult;
  onClose: () => void;
}

export const DataHubWritebackModal: React.FC<DataHubWritebackModalProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 text-emerald-900 p-2.5 rounded-2xl border border-emerald-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Published to DataHub</h3>
              <p className="text-xs text-slate-600 font-medium">Closed-loop metadata & lineage registration complete</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-medium">
          <div>
            <span className="text-slate-700 uppercase tracking-wider font-extrabold text-[10px]">Registered Dataset URN:</span>
            <div className="font-mono text-slate-900 font-bold bg-white p-2.5 rounded-xl mt-1 break-all border border-slate-300 shadow-inner">
              {result.dataset_urn}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-slate-800">
            <span className="flex items-center space-x-1.5 font-bold">
              <GitCommit className="w-3.5 h-3.5 text-sky-600" />
              <span>Upstream Lineage Linked:</span>
            </span>
            <span className="font-mono font-extrabold text-slate-900">{result.lineage_added.length} asset(s)</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-slate-800">
            <span className="flex items-center space-x-1.5 font-bold">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Metadata Tags Ingested:</span>
            </span>
            <div className="flex space-x-1">
              {result.tags_added.map(t => (
                <span key={t} className="bg-slate-200 text-slate-900 border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-slate-800">
            <span className="flex items-center space-x-1.5 font-bold">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Documentation Ingested:</span>
            </span>
            <span className="text-emerald-800 font-extrabold">Updated README Aspect</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3 rounded-2xl text-xs transition shadow-md"
        >
          Done
        </button>
      </div>
    </div>
  );
};
