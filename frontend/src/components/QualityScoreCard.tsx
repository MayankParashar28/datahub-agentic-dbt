import React from 'react';
import { MetadataQualityScore } from '../types';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface QualityScoreCardProps {
  qualityScore?: MetadataQualityScore | null;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({ qualityScore }) => {
  if (!qualityScore) return null;

  const score = qualityScore.overall_score;

  const getBadgeStyle = (s: number) => {
    if (s >= 80) return { color: 'text-emerald-900', bg: 'bg-emerald-50', border: 'border-emerald-300' };
    if (s >= 60) return { color: 'text-amber-900', bg: 'bg-amber-50', border: 'border-amber-300' };
    return { color: 'text-rose-900', bg: 'bg-rose-50', border: 'border-rose-300' };
  };

  const style = getBadgeStyle(score);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-5">
      {/* Top Header & Big Score Meter */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-mono font-bold">2</span>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">DataHub Metadata Quality Score</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium">Evaluates schema completeness, documentation coverage, and lineage</p>
        </div>

        <div className={`px-4 py-2 rounded-xl border font-mono font-extrabold text-2xl flex items-baseline space-x-1 ${style.bg} ${style.border} ${style.color}`}>
          <span>{score}</span>
          <span className="text-xs font-bold text-slate-500">/100</span>
        </div>
      </div>

      {/* Breakdown Bar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 text-[10px] uppercase font-bold">Schema</div>
          <div className="font-mono text-slate-900 font-extrabold text-sm mt-0.5">{qualityScore.breakdown.schema_score}<span className="text-slate-500 text-xs font-normal">/25</span></div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 text-[10px] uppercase font-bold">Lineage</div>
          <div className="font-mono text-slate-900 font-extrabold text-sm mt-0.5">{qualityScore.breakdown.lineage_score}<span className="text-slate-500 text-xs font-normal">/20</span></div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 text-[10px] uppercase font-bold">Docs Coverage</div>
          <div className="font-mono text-slate-900 font-extrabold text-sm mt-0.5">{qualityScore.breakdown.description_coverage_score}<span className="text-slate-500 text-xs font-normal">/25</span></div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 text-[10px] uppercase font-bold">Glossary</div>
          <div className="font-mono text-slate-900 font-extrabold text-sm mt-0.5">{qualityScore.breakdown.glossary_score}<span className="text-slate-500 text-xs font-normal">/15</span></div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 text-[10px] uppercase font-bold">Governance</div>
          <div className="font-mono text-slate-900 font-extrabold text-sm mt-0.5">{qualityScore.breakdown.governance_score}<span className="text-slate-500 text-xs font-normal">/15</span></div>
        </div>
      </div>

      {/* Detected Metadata Gaps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Detected Metadata Gaps ({qualityScore.gaps.length})</span>
          </h4>
          <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
            Surfaced (Not Hallucinated)
          </span>
        </div>

        {qualityScore.gaps.length === 0 ? (
          <div className="text-xs text-emerald-900 flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Complete metadata context. No gaps detected.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {qualityScore.gaps.map((gap, idx) => (
              <div key={idx} className="bg-amber-50/80 border border-amber-300 p-3 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-amber-900 text-xs">{gap.gap_type}</span>
                  <span className="text-[10px] bg-white text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                    {gap.column ? `Target Column: ${gap.column}` : 'Dataset-level'}
                  </span>
                </div>
                <p className="text-amber-950 font-medium">{gap.description}</p>
                <div className="text-[11px] text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200 flex items-start space-x-1 font-medium">
                  <span className="font-bold text-slate-900 shrink-0">Agent Action:</span>
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
