import React from 'react';
import { ShieldCheck, Brain, FileCode, MessageSquare } from 'lucide-react';

export type StudioTab = 'context' | 'reasoning' | 'artifacts' | 'chat';

type BadgeTone = 'neutral' | 'good' | 'bad' | 'info';

interface TabDef {
  id: StudioTab;
  index: number;
  label: string;
  icon: React.ReactNode;
  badge?: { text: string; tone: BadgeTone };
}

interface StudioTabsProps {
  activeTab: StudioTab;
  onChange: (tab: StudioTab) => void;
  qualityScore?: number | null;
  hasArtifacts: boolean;
  validationPassed?: boolean;
}

/**
 * Four-across studio tab strip.
 *
 * Fixes three defects in the original inline implementation:
 *  - `space-x-2` + `flex-wrap` orphaned the fourth tab onto its own row
 *  - the artifacts badge was hardcoded to "Verified" regardless of validation state
 *  - the chat badge used light-on-light colours and rendered as an empty pill
 */
export const StudioTabs: React.FC<StudioTabsProps> = ({
  activeTab,
  onChange,
  qualityScore,
  hasArtifacts,
  validationPassed
}) => {
  const tabs: TabDef[] = [
    {
      id: 'context',
      index: 1,
      label: 'DataHub Context',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge:
        qualityScore != null
          ? { text: `${qualityScore}/100`, tone: qualityScore >= 80 ? 'good' : 'info' }
          : undefined
    },
    {
      id: 'reasoning',
      index: 2,
      label: 'Agent Reasoning',
      icon: <Brain className="w-4 h-4" />,
      badge: hasArtifacts ? { text: 'Ready', tone: 'good' } : undefined
    },
    {
      id: 'artifacts',
      index: 3,
      label: 'dbt Assets & Publish',
      icon: <FileCode className="w-4 h-4" />,
      badge: hasArtifacts
        ? validationPassed
          ? { text: 'Verified', tone: 'good' }
          : { text: 'Blocked', tone: 'bad' }
        : undefined
    },
    {
      id: 'chat',
      index: 4,
      label: 'AI Assistant',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: { text: 'Live', tone: 'info' }
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left',
              'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60',
              isActive
                ? 'bg-surface-hover text-content border-line-strong'
                : 'bg-surface text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
            ].join(' ')}
          >
            <span
              className={[
                'flex items-center justify-center w-7 h-7 shrink-0 rounded-xl text-[11px] font-mono font-bold',
                isActive ? 'bg-accent/15 text-accent' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
              ].join(' ')}
            >
              {tab.index}
            </span>

            <span className={isActive ? 'text-accent' : 'text-slate-400'}>{tab.icon}</span>

            <span className="flex-1 min-w-0">
              <span className="block text-[11px] font-extrabold uppercase tracking-wide truncate">
                {tab.label}
              </span>
            </span>

            {tab.badge && <Badge tone={tab.badge.tone} isActive={isActive} text={tab.badge.text} />}
          </button>
        );
      })}
    </div>
  );
};

const Badge: React.FC<{ tone: BadgeTone; isActive: boolean; text: string }> = ({ tone, isActive, text }) => {
  // Every combination below is deliberately dark-on-light or light-on-dark.
  const palette: Record<BadgeTone, { active: string; idle: string }> = {
    good: { active: 'bg-emerald-400/20 text-emerald-300', idle: 'bg-emerald-100 text-emerald-800' },
    bad: { active: 'bg-rose-400/20 text-rose-300', idle: 'bg-rose-100 text-rose-800' },
    info: { active: 'bg-sky-400/20 text-sky-300', idle: 'bg-sky-100 text-sky-800' },
    neutral: { active: 'bg-white/10 text-slate-200', idle: 'bg-slate-100 text-slate-700' }
  };

  return (
    <span
      className={[
        'shrink-0 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold',
        isActive ? palette[tone].active : palette[tone].idle
      ].join(' ')}
    >
      {text}
    </span>
  );
};
