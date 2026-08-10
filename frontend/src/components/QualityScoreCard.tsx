import React from 'react';
import { MetadataQualityScore } from '../types';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface QualityScoreCardProps {
  qualityScore?: MetadataQualityScore | null;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({ qualityScore }) => {
  if (!qualityScore) return null;

  const score = qualityScore.overall_score;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (s >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Top Header & Big Score Meter */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[11px] font-mono font-bold">2</span>
            <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
              DataHub Metadata Quality Score
            </h3>
          </div>
          <p className="text-xs text-slate-400">Evaluates schema completeness, documentation coverage, and lineage graph integrity</p>
        </div>

        <div className={`px-4 py-2 rounded-xl border font-mono font-extrabold text-2xl flex items-baseline space-x-1 ${getScoreColor(score)}`}>
          <span>{score}</span>
          <span className="text-xs font-bold text-slate-400">/100</span>
        </div>
      </div>

      {/* Breakdown Bar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {[
          { name: 'Schema', val: qualityScore.breakdown.schema_score, max: 25 },
          { name: 'Lineage', val: qualityScore.breakdown.lineage_score, max: 20 },
          { name: 'Docs Coverage', val: qualityScore.breakdown.description_coverage_score, max: 25 },
          { name: 'Glossary Alignment', val: qualityScore.breakdown.glossary_score, max: 15 },
          { name: 'Governance', val: qualityScore.breakdown.governance_score, max: 15 }
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-mono font-bold">{item.name}</div>
            <div className="font-mono text-cyan-400 font-extrabold text-base">{item.val}<span className="text-slate-500 text-xs font-normal">/{item.max}</span></div>
          </div>
        ))}
      </div>

      {/* Detected Metadata Gaps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Surfaced Metadata Gaps ({qualityScore.gaps.length})</span>
          </h4>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
            Ground-Truth Audit
          </span>
        </div>

        {qualityScore.gaps.length === 0 ? (
          <div className="text-xs text-emerald-400 flex items-center space-x-2 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Complete metadata context. Zero gaps detected in catalog contract.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {qualityScore.gaps.map((gap, idx) => (
              <div key={idx} className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-amber-400 text-xs">{gap.gap_type}</span>
                  <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    {gap.column ? `Column: ${gap.column}` : 'Dataset-level'}
                  </span>
                </div>
                <p className="text-slate-200 font-medium">{gap.description}</p>
                <div className="text-[11px] text-cyan-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 flex items-start space-x-1.5 font-mono">
                  <span className="font-bold text-white shrink-0">Agent Action:</span>
                  <span>{gap.action_taken}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
