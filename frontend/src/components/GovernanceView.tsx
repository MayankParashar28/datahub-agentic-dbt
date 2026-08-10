import React from 'react';
import { ShieldCheck, Lock, Cpu, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export const GovernanceView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Governance & DataHub Semantic Type Checker</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Enterprise Safety & Semantic Integrity Center</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            DataHub dbt Forge enforces strict schema contracts, semantic type checking via DataHub Glossary, AST hallucination defense, and zero secret logging.
          </p>
        </div>
        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs px-4 py-2 rounded-2xl font-bold">
          100% GREEN Safety Guard
        </span>
      </div>

      {/* 3 Governance Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 font-mono">1. DataHub Glossary Type System</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Treats DataHub business glossary terms as semantic types. Blocks mathematically invalid rate sums (`SUM(avg_price)`) and mismatched currency arithmetic (`USD + EUR`).
          </p>
          <div className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            ✓ Active & Enforced
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-3">
          <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 font-mono">2. `sqlglot` Multi-Dialect AST Guard</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Parses SQL into AST nodes across Snowflake, Postgres, BigQuery, and DuckDB dialects to ensure zero fabricated table or column references.
          </p>
          <div className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-200">
            ✓ 0 Column Hallucinations
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 font-mono">3. Security & Secret Safeguards</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Automated key masking (`AQ.A***g59A`), in-memory API rate limiting (30 req/min), and strict CORS origin boundaries.
          </p>
          <div className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
            ✓ Secrets Sanitized
          </div>
        </div>
      </div>
    </div>
  );
};
