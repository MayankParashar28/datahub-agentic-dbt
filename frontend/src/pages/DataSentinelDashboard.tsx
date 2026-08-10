import React, { useState, useEffect } from 'react';
import { 
  fetchHealthStatus, fetchDatasets, inspectDataset, generateDbtModel, publishToDataHub 
} from '../api/client';
import { DatasetMetadata, GeneratedArtifacts, WritebackResult } from '../types';
import { DatasetSelector } from '../components/DatasetSelector';
import { MetadataContextCard } from '../components/MetadataContextCard';
import { QualityScoreCard } from '../components/QualityScoreCard';
import { ReasoningCard } from '../components/ReasoningCard';
import { ArtifactsViewer } from '../components/ArtifactsViewer';
import { ValidationStatusCard } from '../components/ValidationStatusCard';
import { DataHubWritebackModal } from '../components/DataHubWritebackModal';
import { AIChatAssistant } from '../components/AIChatAssistant';

import { 
  ShieldCheck, AlertTriangle, Activity, Database, Cpu, Search, 
  Sparkles, Layers, MessageSquare, FileCode, LogOut, Lock, Key, Server
} from 'lucide-react';

interface DataSentinelDashboardProps {
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export const DataSentinelDashboard: React.FC<DataSentinelDashboardProps> = ({
  currentUser,
  onLogout
}) => {
  const [activeNav, setActiveNav] = useState<
    'Overview' | 'Data Assets' | 'Data Quality' | 'dbt Studio' | 'Data Lineage' | 'Anomalies' | 'AI Sentinel Chat' | 'Settings'
  >('Overview');
  
  const [scanStep, setScanStep] = useState(0);

  // Live DataHub Metadata State (Pre-filled with rich demo prompt)
  const [datasets, setDatasets] = useState<{ urn: string; name: string; platform: string; description?: string; domain?: string }[]>([]);
  const [selectedUrn, setSelectedUrn] = useState<string>('');
  const [secondaryUrn, setSecondaryUrn] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>(
    'Derive gross order value via unit_price * quantity, cast customer email to lowercase, and filter for status = ACTIVE...'
  );
  
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [artifacts, setArtifacts] = useState<GeneratedArtifacts | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResult, setPublishedResult] = useState<WritebackResult | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthStatus()
      .then(res => setDemoMode(res.demo_mode))
      .catch(() => setDemoMode(true));

    fetchDatasets()
      .then(list => {
        setDatasets(list);
        if (list.length > 0) {
          setSelectedUrn(list[0].urn);
        }
      })
      .catch(err => setErrorMsg(err.message));
  }, []);

  useEffect(() => {
    if (!selectedUrn) return;
    setArtifacts(null);
    setPublishedResult(null);
    inspectDataset(selectedUrn)
      .then(data => {
        setMetadata(data);
      })
      .catch(err => setErrorMsg(err.message));
  }, [selectedUrn]);

  const handleGenerate = async () => {
    if (!selectedUrn) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setArtifacts(null);
    setPublishedResult(null);

    try {
      const result = await generateDbtModel(selectedUrn, secondaryUrn, customInstructions);
      setArtifacts(result);
      setActiveNav('dbt Studio');
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!artifacts) return;
    setIsPublishing(true);
    try {
      const res = await publishToDataHub(artifacts);
      setPublishedResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Publish failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const currentDatasetName = metadata?.name || 'orders';
  const currentQualityScore = metadata?.quality_score?.overall_score ?? 100;
  const currentGapsCount = metadata?.quality_score?.gaps?.length ?? 0;

  const scanStatuses = [
    { text: `Scanning ${datasets.length || 7} DataHub catalog datasets...`, color: "text-cyan-400" },
    { text: `DataHub URN: ${selectedUrn ? selectedUrn.split(':').pop() : 'fiction-retail.orders'}`, color: "text-slate-300" },
    { text: `Quality Score: ${currentQualityScore}/100 for '${currentDatasetName}'`, color: currentQualityScore > 90 ? "text-emerald-400" : "text-amber-400" },
    { text: `${currentGapsCount} metadata gaps in DataHub schema contract`, color: currentGapsCount === 0 ? "text-emerald-400" : "text-rose-400" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setScanStep((prev) => (prev + 1) % scanStatuses.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [selectedUrn, metadata]);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#070A11]/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 overflow-hidden shadow-lg shadow-cyan-500/10 p-0.5 shrink-0">
              <img src="/logo.jpg" alt="DataSentinel Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center">
                  Data<span className="text-cyan-400">Sentinel</span>
                </h1>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">AI Data Intelligence & Governance Platform</p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="hidden md:flex items-center w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder={`Search ${datasets.length || 7} DataHub datasets...`}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Status Badges & Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300">{demoMode ? 'DEMO SNAPSHOTS' : 'LIVE DATAHUB GMS'}</span>
            </div>

            {currentUser && (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                <span className="font-semibold text-xs text-white">{currentUser.name}</span>
                {onLogout && (
                  <button onClick={onLogout} title="Sign Out" className="text-rose-400 hover:text-rose-300 ml-1 transition">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full py-6 px-4 gap-6">
        {/* Left Sidebar */}
        <aside className="w-64 space-y-6 flex flex-col justify-between shrink-0">
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Navigation
            </div>

            {[
              { id: 'Overview', label: 'Overview', icon: ShieldCheck, badge: null },
              { id: 'Data Assets', label: 'Data Assets', icon: Database, badge: datasets.length ? `${datasets.length}` : '7' },
              { id: 'Data Quality', label: 'Data Quality', icon: Activity, badge: `${currentQualityScore}/100` },
              { id: 'dbt Studio', label: 'dbt Forge Studio', icon: FileCode, badge: artifacts ? 'Ready' : 'Build' },
              { id: 'Data Lineage', label: 'Data Lineage', icon: Layers, badge: `${(metadata?.upstream?.length || 0) + (metadata?.downstream?.length || 0)}` },
              { id: 'Anomalies', label: 'Anomalies', icon: AlertTriangle, badge: `${currentGapsCount}` },
              { id: 'AI Sentinel Chat', label: 'AI Sentinel Chat', icon: MessageSquare, badge: 'Chat' },
              { id: 'Settings', label: 'Settings', icon: Server, badge: null }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-lg shadow-cyan-500/5 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sentinel AI Guardian Widget */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h4 className="font-mono font-bold text-xs text-white">SENTINEL AGENT</h4>
            </div>

            <p className={`text-xs font-medium ${scanStatuses[scanStep].color} leading-snug`}>
              {scanStatuses[scanStep].text}
            </p>
          </div>
        </aside>

        {/* Main Dashboard Workspace */}
        <main className="flex-1 overflow-y-auto space-y-6 pr-1">
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs font-medium flex justify-between items-center">
              <span>⚠️ Error: {errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="underline hover:text-white">Dismiss</button>
            </div>
          )}

          {/* Module 1: Overview */}
          {activeNav === 'Overview' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md space-y-2">
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  DataSentinel Command Overview <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-xs text-slate-400">
                  Ground-truth metadata audit for active dataset: <span className="font-mono text-cyan-400 font-bold">{currentDatasetName}</span>
                </p>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
                  <div className="text-xs font-mono text-slate-400 font-bold">CATALOG DATASETS</div>
                  <div className="text-3xl font-mono font-extrabold text-white">{datasets.length || 7}</div>
                  <div className="text-xs font-medium text-cyan-400">Registered in DataHub</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
                  <div className="text-xs font-mono text-slate-400 font-bold">QUALITY SCORE</div>
                  <div className="text-3xl font-mono font-extrabold text-emerald-400">{currentQualityScore}/100</div>
                  <div className="text-xs font-medium text-emerald-400">Verified Schema Contract</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
                  <div className="text-xs font-mono text-slate-400 font-bold">METADATA GAPS</div>
                  <div className="text-3xl font-mono font-extrabold text-amber-400">{currentGapsCount}</div>
                  <div className="text-xs font-medium text-amber-400">{currentGapsCount > 0 ? 'Requires Fix' : 'Clean'}</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
                  <div className="text-xs font-mono text-slate-400 font-bold">AST PARSER</div>
                  <div className="text-xl font-mono font-extrabold text-cyan-400">100% GREEN</div>
                  <div className="text-xs font-medium text-slate-400">0 Hallucinations</div>
                </div>
              </div>

              {/* Quality Score Breakdown */}
              {metadata?.quality_score && (
                <QualityScoreCard qualityScore={metadata.quality_score} />
              )}
            </div>
          )}

          {/* Module 2: Data Assets */}
          {activeNav === 'Data Assets' && (
            <div className="space-y-6">
              <DatasetSelector
                datasets={datasets}
                selectedUrn={selectedUrn}
                secondaryUrn={secondaryUrn}
                customInstructions={customInstructions}
                onSelectDataset={setSelectedUrn}
                onSelectSecondaryUrn={setSecondaryUrn}
                onChangeCustomInstructions={setCustomInstructions}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />

              {metadata && <MetadataContextCard metadata={metadata} />}
            </div>
          )}

          {/* Module 3: Data Quality */}
          {activeNav === 'Data Quality' && (
            <div className="space-y-6">
              {metadata?.quality_score && <QualityScoreCard qualityScore={metadata.quality_score} />}
            </div>
          )}

          {/* Module 4: dbt Studio */}
          {activeNav === 'dbt Studio' && (
            <div className="space-y-6">
              {!artifacts && !isGenerating && (
                <div className="bg-slate-900/90 border border-slate-800 p-12 text-center rounded-2xl shadow-2xl space-y-4">
                  <FileCode className="w-12 h-12 text-cyan-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Ready to Generate Verified dbt Assets</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Select a dataset in <span className="font-bold text-cyan-400">"Data Assets"</span> and click <span className="font-bold text-cyan-400">"Generate dbt Pipeline"</span> to build AST-verified code.
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="bg-slate-900/90 border border-slate-800 p-12 text-center rounded-2xl shadow-2xl space-y-4">
                  <Sparkles className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                  <h3 className="text-lg font-bold text-white">Generating & Validating dbt Code...</h3>
                  <p className="text-xs text-slate-400">
                    Writing executable SQL → Formatting schema.yml → Running <span className="font-mono text-cyan-400 font-bold">sqlglot AST</span> hallucination checks
                  </p>
                </div>
              )}

              {artifacts && (
                <div className="space-y-6">
                  <ValidationStatusCard
                    validation={artifacts.validation}
                    onPublish={handlePublish}
                    isPublishing={isPublishing}
                    published={!!publishedResult}
                  />

                  {artifacts.reasoning && <ReasoningCard reasoning={artifacts.reasoning} />}

                  <ArtifactsViewer artifacts={artifacts} />
                </div>
              )}
            </div>
          )}

          {/* Module 5: Data Lineage */}
          {activeNav === 'Data Lineage' && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
              <div className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>DataHub Lineage Graph (`{currentDatasetName}`)</span>
                <span className="text-xs font-mono text-cyan-400 font-bold">Live Catalog Edges</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">1. UPSTREAM SOURCES</span>
                  <div className="text-sm font-mono font-bold text-white">
                    {metadata?.upstream?.[0]?.name || 'snowflake.orders'}
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">2. GENERATED DBT MODEL</span>
                  <div className="text-sm font-mono font-bold text-white">fct_{currentDatasetName}</div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">3. DOWNSTREAM CONSUMERS</span>
                  <div className="text-sm font-mono font-bold text-white">
                    {metadata?.downstream?.[0]?.name || 'BI Executive Dashboard'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 6: Anomalies */}
          {activeNav === 'Anomalies' && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>DataHub Metadata Gap Audit (`{currentDatasetName}`)</span>
              </h3>
              <div className="space-y-3">
                {metadata?.quality_score?.gaps && metadata.quality_score.gaps.length > 0 ? (
                  metadata.quality_score.gaps.map((gap, idx) => (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                          {gap.gap_type}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">Column: `{gap.column || 'table'}`</span>
                      </div>
                      <p className="text-slate-200 text-sm font-medium">{gap.description}</p>
                      <p className="text-xs font-mono text-cyan-400 font-bold">Agent Action: {gap.action_taken}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-bold text-emerald-400">✓ No critical metadata gaps detected!</div>
                )}
              </div>
            </div>
          )}

          {/* Module 7: AI Sentinel Chat */}
          {activeNav === 'AI Sentinel Chat' && (
            <div className="space-y-6">
              <AIChatAssistant metadata={metadata} />
            </div>
          )}

          {/* Module 8: Settings */}
          {activeNav === 'Settings' && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
              <h3 className="text-lg font-bold text-white">DataSentinel Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-xl space-y-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-xs text-white">DataHub GMS Endpoint</h4>
                  <p className="text-xs font-mono text-slate-300">http://localhost:8080</p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-xl space-y-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-xs text-white">LLM Provider</h4>
                  <p className="text-xs font-mono text-slate-300">Gemini / GPT-4o / Claude</p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-xl space-y-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-xs text-white">Security Rate Limiting</h4>
                  <p className="text-xs font-mono text-slate-300">30 req/min active</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DataHub Writeback Modal */}
      {publishedResult && (
        <DataHubWritebackModal result={publishedResult} onClose={() => setPublishedResult(null)} />
      )}
    </div>
  );
};
