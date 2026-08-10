import React from 'react';
import { ReasoningObject } from '../types';
import { Brain, Calculator, CheckSquare, HelpCircle, Lightbulb } from 'lucide-react';

interface ReasoningCardProps {
  reasoning: ReasoningObject;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({ reasoning }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-5 text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-sm">
            <Brain className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Agent Structured Reasoning Plan</h3>
            <p className="text-[11px] text-slate-600 font-medium">Target dbt Model: <span className="font-mono text-sky-700 font-bold">{reasoning.target_model}</span></p>
          </div>
        </div>

        <div className="text-[11px] bg-slate-100 border border-slate-300 px-3 py-1 rounded-xl text-slate-900 font-mono font-bold">
          Grain: {reasoning.grain}
        </div>
      </div>

      {/* CTE Transformations Math */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
          <Calculator className="w-3.5 h-3.5 text-sky-600" />
          <span>Derived Transformations ({reasoning.transformations.length})</span>
        </h4>
        {reasoning.transformations.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">Direct column mapping model. No derived arithmetic expressions.</p>
        ) : (
          <div className="space-y-2">
            {reasoning.transformations.map((t, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 font-mono text-slate-900 font-bold">
                  <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded border border-sky-300">{t.expression}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-emerald-700">{t.output}</span>
                </div>
                <p className="text-slate-700 font-medium">{t.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Rationale Grid */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Generated dbt Data Quality Tests ({reasoning.tests.length})</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {reasoning.tests.map((test, idx) => (
            <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <span className="font-mono text-slate-900 font-bold">{test.column}</span>
                <p className="text-[10px] text-slate-600 font-medium mt-0.5">{test.reason}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ml-2">
                ✓ {test.test}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Explainability Log */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>Decision Explainability Audit Log ({reasoning.explainability.length})</span>
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {reasoning.explainability.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{item.decision}</span>
                <span className="text-[10px] bg-slate-200 text-slate-800 border border-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                  {item.confidence} Confidence
                </span>
              </div>
              <p className="text-slate-700 font-medium">
                <span className="font-bold text-slate-900">DataHub Evidence: </span>
                {item.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions */}
      <div className="space-y-1.5 bg-slate-100 p-3 rounded-xl border border-slate-200">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 text-[10px]">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Explicit Engineering Assumptions</span>
        </h4>
        <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] font-medium">
          {reasoning.assumptions.map((asm, idx) => (
            <li key={idx}>{asm}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
