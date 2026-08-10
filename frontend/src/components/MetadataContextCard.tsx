import React, { useState } from 'react';
import { DatasetMetadata } from '../types';
import { Table, GitCommit, BookOpen, Shield, Key, UserCheck } from 'lucide-react';

interface MetadataContextCardProps {
  metadata: DatasetMetadata;
}

export const MetadataContextCard: React.FC<MetadataContextCardProps> = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'lineage' | 'glossary' | 'governance'>('schema');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col h-full">
      {/* Header Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/60 px-4 pt-3 flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'schema'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-cyan-400" />
            <span>Schema ({metadata.columns.length} cols)</span>
          </button>

          <button
            onClick={() => setActiveTab('lineage')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'lineage'
                ? 'bg-slate-900 text-indigo-400 border-indigo-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lineage ({metadata.upstream.length} up / {metadata.downstream.length} down)</span>
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'glossary'
                ? 'bg-slate-900 text-amber-400 border-amber-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Glossary ({metadata.glossary_terms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'governance'
                ? 'bg-slate-900 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Governance ({metadata.owners.length} owners)</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto max-h-96">
        {activeTab === 'schema' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider font-mono font-bold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Tags & Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {metadata.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-white flex items-center space-x-1.5">
                      {col.is_primary_key && <Key className="w-3.5 h-3.5 text-amber-400 inline" />}
                      <span>{col.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400 font-semibold">{col.data_type}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {col.description ? (
                        col.description
                      ) : (
                        <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold text-[10px]">
                          ⚠ Missing description
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {col.tags.map(t => (
                          <span key={t} className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold">
                            {t}
                          </span>
                        ))}
                        {col.glossary_terms.map(g => (
                          <span key={g} className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                            📖 {g}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'lineage' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider mb-2">Upstream Data Assets</h4>
              {metadata.upstream.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No upstream assets registered.</p>
              ) : (
                <div className="space-y-2">
                  {metadata.upstream.map(u => (
                    <div key={u.urn} className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-mono text-xs text-white font-bold">
                        <span className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded uppercase text-[10px]">{u.platform}</span>
                        <span>{u.name}</span>
                      </div>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">{u.relationship_type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-800"></div>

            <div>
              <h4 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider mb-2">Target & Downstream Lineage</h4>
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 font-mono text-xs text-emerald-400 font-bold">
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">DBT FORGE</span>
                  <span>analytics.{metadata.name.split('.').pop()}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  GENERATED MODEL
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider">Business Glossary Terms</h4>
            {metadata.glossary_terms.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No business glossary terms attached to dataset.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {metadata.glossary_terms.map(term => (
                  <div key={term} className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 font-mono font-extrabold uppercase tracking-wider">Owners: </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {metadata.owners.map(owner => (
                  <span key={owner} className="bg-slate-800 border border-slate-700 text-white px-3 py-1 rounded-xl flex items-center space-x-1.5 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{owner}</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono font-extrabold uppercase tracking-wider">Global Tags: </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {metadata.tags.map(tag => (
                  <span key={tag} className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold">
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
