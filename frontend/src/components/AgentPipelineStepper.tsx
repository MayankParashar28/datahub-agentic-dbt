import React, { useEffect, useState } from 'react';
import { Check, Loader2, Circle } from 'lucide-react';

export interface PipelineStage {
  id: string;
  label: string;
  detail: string;
}

export const DEFAULT_STAGES: PipelineStage[] = [
  { id: 'metadata', label: 'Reading DataHub metadata', detail: 'Schema, lineage, glossary terms, owners' },
  { id: 'semantics', label: 'Resolving semantic types', detail: 'Glossary terms mapped to a type contract' },
  { id: 'reasoning', label: 'Formulating reasoning plan', detail: 'Grain, transformations, test rationale' },
  { id: 'generation', label: 'Generating dbt artifacts', detail: 'model.sql, schema.yml, README.md' },
  { id: 'validation', label: 'Validating against contracts', detail: 'sqlglot AST, semantics, grain, governance' }
];

interface AgentPipelineStepperProps {
  isRunning: boolean;
  /** Milliseconds each stage is displayed while the request is in flight. */
  stageDurationMs?: number;
  stages?: PipelineStage[];
}

/**
 * Live progression through the agent pipeline.
 *
 * A result that materialises instantly reads as a static mockup. Showing the stages
 * advance makes the system legible: the viewer sees metadata resolved before reasoning,
 * and reasoning before generation, which is the whole architectural claim.
 */
export const AgentPipelineStepper: React.FC<AgentPipelineStepperProps> = ({
  isRunning,
  stageDurationMs = 900,
  stages = DEFAULT_STAGES
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      setCurrent(0);
      return;
    }

    setCurrent(0);
    const timer = setInterval(() => {
      // Hold on the final stage until the request actually resolves.
      setCurrent(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, stageDurationMs);

    return () => clearInterval(timer);
  }, [isRunning, stageDurationMs, stages.length]);

  if (!isRunning) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
      <div className="flex items-center gap-2 mb-5">
        <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Agent Pipeline Executing
        </h3>
      </div>

      <ol className="space-y-1">
        {stages.map((stage, idx) => {
          const done = idx < current;
          const active = idx === current;

          return (
            <li
              key={stage.id}
              className={[
                'flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-300',
                active ? 'bg-sky-50' : 'bg-transparent'
              ].join(' ')}
            >
              <span className="mt-0.5 shrink-0">
                {done ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300">
                    <Check className="w-3 h-3 text-emerald-700" />
                  </span>
                ) : active ? (
                  <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </span>

              <span className="min-w-0">
                <span
                  className={[
                    'block text-xs font-bold',
                    done ? 'text-slate-500' : active ? 'text-slate-900' : 'text-slate-400'
                  ].join(' ')}
                >
                  {stage.label}
                </span>
                <span
                  className={[
                    'block text-[11px] font-medium font-mono mt-0.5',
                    active ? 'text-slate-600' : 'text-slate-400'
                  ].join(' ')}
                >
                  {stage.detail}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / stages.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
