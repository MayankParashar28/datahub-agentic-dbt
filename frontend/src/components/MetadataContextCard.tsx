import React, { useState } from 'react';
import { DatasetMetadata } from '../types';
import { Table, GitCommit, BookOpen, Shield, Key, UserCheck } from 'lucide-react';

interface MetadataContextCardProps {
  metadata: DatasetMetadata;
}

export const MetadataContextCard: React.FC<MetadataContextCardProps> = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'lineage' | 'glossary' | 'governance'>('schema');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Header Tabs */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 pt-3 flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'schema'
                ? 'bg-white text-slate-900 border-slate-900'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-sky-600" />
            <span>Schema ({metadata.columns.length} cols)</span>
          </button>

          <button
            onClick={() => setActiveTab('lineage')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'lineage'
                ? 'bg-white text-slate-900 border-slate-900'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lineage ({metadata.upstream.length} up / {metadata.downstream.length} down)</span>
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'glossary'
                ? 'bg-white text-slate-900 border-slate-900'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Glossary ({metadata.glossary_terms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-extrabold rounded-t-xl transition border-t-2 ${
              activeTab === 'governance'
                ? 'bg-white text-slate-900 border-slate-900'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Governance ({metadata.owners.length} owners)</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto max-h-96">
        {activeTab === 'schema' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-mono font-bold">
                <tr>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Tags & Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans font-medium text-slate-900">
                {metadata.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 flex items-center space-x-1.5">
                      {col.is_primary_key && <Key className="w-3.5 h-3.5 text-amber-600 inline" />}
                      <span>{col.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 font-semibold">{col.data_type}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {col.description ? (
                        col.description
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold text-[10px]">
                          ⚠ Missing description
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {col.tags.map(t => (
                          <span key={t} className="bg-slate-100 text-slate-800 border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            {t}
                          </span>
                        ))}
                        {col.glossary_terms.map(g => (
                          <span key={g} className="bg-sky-50 text-sky-900 border border-sky-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
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
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Upstream Data Assets</h4>
              {metadata.upstream.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No upstream assets registered.</p>
              ) : (
                <div className="space-y-2">
                  {metadata.upstream.map(u => (
                    <div key={u.urn} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-mono text-xs text-slate-900 font-bold">
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded uppercase">{u.platform}</span>
                        <span>{u.name}</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">{u.relationship_type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-200"></div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Target & Downstream Lineage</h4>
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 font-mono text-xs text-emerald-900 font-bold">
                  <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">DBT FORGE</span>
                  <span>analytics.{metadata.name.split('.').pop()}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                  GENERATED MODEL
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Business Glossary Terms</h4>
            {metadata.glossary_terms.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No business glossary terms attached to dataset.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {metadata.glossary_terms.map(term => (
                  <div key={term} className="bg-sky-50 border border-sky-300 text-sky-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-4 text-xs font-medium">
            <div>
              <span className="text-slate-700 font-extrabold uppercase tracking-wider">Owners: </span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {metadata.owners.map(owner => (
                  <span key={owner} className="bg-slate-100 border border-slate-300 text-slate-900 px-3 py-1 rounded-xl flex items-center space-x-1.5 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{owner}</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-700 font-extrabold uppercase tracking-wider">Global Tags: </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {metadata.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 border border-slate-300 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
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
