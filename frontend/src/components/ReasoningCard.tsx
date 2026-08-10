import React from 'react';
import { ReasoningObject } from '../types';
import { Brain, Calculator, CheckSquare, HelpCircle, Lightbulb } from 'lucide-react';

interface ReasoningCardProps {
  reasoning: ReasoningObject;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({ reasoning }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5 text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm">
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">Agent Structured Reasoning Plan</h3>
            <p className="text-[11px] text-slate-400">Target dbt Model: <span className="font-mono text-cyan-400 font-bold">{reasoning.target_model}</span></p>
          </div>
        </div>

        <div className="text-[11px] bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl text-cyan-400 font-mono font-bold">
          Grain: {reasoning.grain}
        </div>
      </div>

      {/* CTE Transformations Math */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-mono font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span>Derived Transformations ({reasoning.transformations.length})</span>
        </h4>
        {reasoning.transformations.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">Direct column mapping model. No derived arithmetic expressions.</p>
        ) : (
          <div className="space-y-2">
            {reasoning.transformations.map((t, idx) => (
              <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center space-x-2 font-mono text-white font-bold">
                  <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 text-[11px]">{t.expression}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-emerald-400">{t.output}</span>
                </div>
                <p className="text-slate-300 text-[11px] font-medium">{t.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Rationale Grid */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-mono font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Generated dbt Quality Tests ({reasoning.tests.length})</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {reasoning.tests.map((test, idx) => (
            <div key={idx} className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-start justify-between">
              <div>
                <span className="font-mono text-white font-bold">{test.column}</span>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{test.reason}</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ml-2">
                ✓ {test.test}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Explainability Log */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-mono font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Decision Explainability Audit Log ({reasoning.explainability.length})</span>
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {reasoning.explainability.map((item, idx) => (
            <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white">{item.decision}</span>
                <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                  {item.confidence} Confidence
                </span>
              </div>
              <p className="text-slate-300 font-medium">
                <span className="font-bold text-cyan-400 font-mono">DataHub Evidence: </span>
                {item.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions */}
      <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <h4 className="font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 text-[10px]">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Engineering Assumptions</span>
        </h4>
        <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px] font-medium">
          {reasoning.assumptions.map((asm, idx) => (
            <li key={idx}>{asm}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
