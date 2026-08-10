import React from 'react';
import { ValidationResult } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle, UploadCloud, RefreshCw } from 'lucide-react';

interface ValidationStatusCardProps {
  validation: ValidationResult;
  onPublish: () => void;
  isPublishing: boolean;
  published: boolean;
}

export const ValidationStatusCard: React.FC<ValidationStatusCardProps> = ({
  validation,
  onPublish,
  isPublishing,
  published
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {validation.is_valid ? (
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300">
                <ShieldAlert className="w-5 h-5 text-rose-700" />
              </div>
            )}
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Artifact Validation & Hallucination Checks
            </h3>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {validation.repair_attempts > 0
              ? `Passed after ${validation.repair_attempts} self-repair retry attempt(s)`
              : 'Passed 100% of verification checks on first attempt'}
          </p>
        </div>

        <button
          onClick={onPublish}
          disabled={!validation.is_valid || isPublishing || published}
          className={`flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md transition-all duration-200 ${
            published
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default font-bold'
              : validation.is_valid
              ? 'bg-slate-900 hover:bg-black text-white border border-slate-900 hover:scale-[1.02]'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
          }`}
        >
          {isPublishing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-sky-400" />
              <span>{published ? 'Published to DataHub' : 'Publish to DataHub'}</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {validation.checks.map((chk, idx) => (
          <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-slate-900 font-bold">{chk.name}</div>
              <div className="text-[10px] text-slate-600 font-medium">{chk.details}</div>
            </div>
            <div className="flex items-center space-x-1 font-mono text-[11px] shrink-0 ml-2 font-bold">
              {chk.passed ? (
                <span className="text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 inline text-emerald-700" />
                  <span>PASS</span>
                </span>
              ) : (
                <span className="text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5 inline text-rose-700" />
                  <span>FAIL</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
