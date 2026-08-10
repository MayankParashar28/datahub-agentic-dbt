import React, { useState } from 'react';
import { GeneratedArtifacts } from '../types';
import { downloadProjectZip } from '../api/client';
import { FileCode, FileText, Copy, Check, Terminal, Download, Archive, ShieldCheck } from 'lucide-react';

interface ArtifactsViewerProps {
  artifacts: GeneratedArtifacts;
}

export const ArtifactsViewer: React.FC<ArtifactsViewerProps> = ({ artifacts }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'yaml' | 'readme'>('sql');
  const [copied, setCopied] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const getActiveContent = () => {
    if (activeTab === 'sql') return artifacts.sql;
    if (activeTab === 'yaml') return artifacts.schema_yml;
    return artifacts.readme_md;
  };

  const getActiveFilename = () => {
    if (activeTab === 'sql') return `${artifacts.model_name}.sql`;
    if (activeTab === 'yaml') return 'schema.yml';
    return 'README.md';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const element = document.createElement("a");
    const file = new Blob([getActiveContent()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = getActiveFilename();
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      await downloadProjectZip(artifacts);
    } catch (e) {
      alert("ZIP export failed. Please check backend status.");
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col h-full">
      {/* Tab Navigation Header */}
      <div className="border-b border-slate-800 bg-slate-950/60 px-4 pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition border-t-2 ${
              activeTab === 'sql'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>{artifacts.model_name}.sql</span>
          </button>

          <button
            onClick={() => setActiveTab('yaml')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition border-t-2 ${
              activeTab === 'yaml'
                ? 'bg-slate-900 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>schema.yml</span>
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition border-t-2 ${
              activeTab === 'readme'
                ? 'bg-slate-900 text-amber-400 border-amber-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>README.md</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 py-1">
          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="flex items-center space-x-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition shadow-sm"
          >
            <Archive className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExportingZip ? 'Exporting...' : 'Export dbt Project (.ZIP)'}</span>
          </button>

          <button
            onClick={handleDownloadSingleFile}
            className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>File</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3 py-1.5 rounded-lg transition border border-cyan-400 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Frame */}
      <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-auto max-h-[520px] leading-relaxed">
        <pre className="whitespace-pre-wrap">
          <code>{getActiveContent()}</code>
        </pre>
      </div>

      {/* Code Footer info */}
      <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center space-x-1.5 font-bold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
          <span>Verified against DataHub schema contracts</span>
        </span>
        <span className="font-mono font-bold text-cyan-400">Generator: {artifacts.generator_version}</span>
      </div>
    </div>
  );
};
