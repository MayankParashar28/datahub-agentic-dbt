import React from 'react';
import { ValidationResult } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle, UploadCloud, RefreshCw, Lock } from 'lucide-react';

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
  const passedCount = validation.checks.filter(c => c.passed).length;
  const totalCount = validation.checks.length;
  const isValid = validation.is_valid;

  return (
    <div
      className={[
        'rounded-3xl border shadow-md overflow-hidden',
        isValid ? 'bg-white border-slate-200' : 'bg-white border-rose-200'
      ].join(' ')}
    >
      {/* Verdict banner — the headline state, not a badge buried in a corner */}
      <div
        className={[
          'px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4',
          isValid ? 'bg-emerald-50/60 border-emerald-100' : 'bg-rose-50/60 border-rose-100'
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <div
            className={[
              'p-2 rounded-xl border shrink-0',
              isValid
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                : 'bg-rose-100 border-rose-300 text-rose-700'
            ].join(' ')}
          >
            {isValid ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              {isValid ? 'Artifacts verified against DataHub contracts' : 'Publication blocked by contract violation'}
            </h3>
            <p className={`text-[11px] font-medium ${isValid ? 'text-slate-600' : 'text-rose-700'}`}>
              {isValid
                ? validation.repair_attempts > 0
                  ? `${passedCount}/${totalCount} checks passed after ${validation.repair_attempts} self-repair attempt(s)`
                  : `${passedCount}/${totalCount} checks passed on the first attempt`
                : `${totalCount - passedCount} of ${totalCount} checks failed after ${validation.repair_attempts} self-repair attempt(s) — the agent refused to publish`}
            </p>
          </div>
        </div>

        <button
          onClick={onPublish}
          disabled={!isValid || isPublishing || published}
          title={!isValid ? 'Publishing is disabled until every contract check passes' : undefined}
          className={[
            'flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl shrink-0',
            'text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all duration-200',
            published
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
              : isValid
              ? 'bg-slate-900 hover:bg-black text-white border border-slate-900 hover:scale-[1.02]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          ].join(' ')}
        >
          {isPublishing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Publishing…</span>
            </>
          ) : !isValid ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Publish Blocked</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-sky-400" />
              <span>{published ? 'Published to DataHub' : 'Publish to DataHub'}</span>
            </>
          )}
        </button>
      </div>

      {/* Individual contract checks */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-2">
        {validation.checks.map((chk, idx) => (
          <div
            key={idx}
            className={[
              'p-3 rounded-2xl border flex items-start justify-between gap-3',
              chk.passed ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'
            ].join(' ')}
          >
            <div className="min-w-0">
              <div className={`text-xs font-bold ${chk.passed ? 'text-slate-900' : 'text-rose-900'}`}>
                {chk.name}
              </div>
              <div className={`text-[10px] font-medium mt-0.5 ${chk.passed ? 'text-slate-600' : 'text-rose-700'}`}>
                {chk.details}
              </div>
            </div>

            <span
              className={[
                'shrink-0 flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold border',
                chk.passed
                  ? 'text-emerald-900 bg-emerald-100 border-emerald-300'
                  : 'text-rose-900 bg-rose-100 border-rose-300'
              ].join(' ')}
            >
              {chk.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{chk.passed ? 'PASS' : 'FAIL'}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Blocking errors, stated plainly */}
      {!isValid && validation.errors.length > 0 && (
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 mb-2">
              Blocking violations
            </div>
            <ul className="space-y-1.5">
              {validation.errors.map((err, idx) => (
                <li key={idx} className="text-[11px] font-mono text-rose-900 leading-relaxed">
                  — {err}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
