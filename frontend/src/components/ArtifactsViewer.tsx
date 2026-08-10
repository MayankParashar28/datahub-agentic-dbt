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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Tab Navigation Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t-2 ${
              activeTab === 'sql'
                ? 'bg-[#0F172A] text-white border-slate-900 font-mono'
                : 'text-slate-700 hover:text-slate-900 border-transparent font-mono'
            }`}
          >
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>{artifacts.model_name}.sql</span>
          </button>

          <button
            onClick={() => setActiveTab('yaml')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t-2 ${
              activeTab === 'yaml'
                ? 'bg-[#0F172A] text-white border-slate-900 font-mono'
                : 'text-slate-700 hover:text-slate-900 border-transparent font-mono'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>schema.yml</span>
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-t-2 ${
              activeTab === 'readme'
                ? 'bg-[#0F172A] text-white border-slate-900 font-mono'
                : 'text-slate-700 hover:text-slate-900 border-transparent font-mono'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>README.md</span>
          </button>
        </div>

        {/* Copy, Download File & Download dbt Project ZIP Actions */}
        <div className="flex items-center space-x-2 py-1">
          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="flex items-center space-x-1.5 text-xs font-bold text-indigo-950 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg border border-indigo-300 transition shadow-sm"
            title="Download complete ready-to-run dbt project archive"
          >
            <Archive className="w-3.5 h-3.5 text-indigo-700" />
            <span>{isExportingZip ? 'Exporting...' : 'Export dbt Project (.ZIP)'}</span>
          </button>

          <button
            onClick={handleDownloadSingleFile}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-black bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-lg border border-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>File</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black px-3 py-1.5 rounded-lg transition border border-slate-900 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
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
      <div className="p-4 bg-[#0F172A] font-mono text-xs text-slate-100 overflow-auto max-h-[520px] leading-relaxed">
        <pre className="whitespace-pre-wrap">
          <code>{getActiveContent()}</code>
        </pre>
      </div>

      {/* Code Footer info */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600 font-medium">
        <span className="flex items-center space-x-1.5 font-bold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
          <span>Verified against DataHub schema contracts</span>
        </span>
        <span className="font-mono font-bold text-slate-800">Generator: {artifacts.generator_version}</span>
      </div>
    </div>
  );
};
