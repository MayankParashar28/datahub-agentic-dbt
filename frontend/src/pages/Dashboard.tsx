import React, { useEffect, useState } from 'react';
import { fetchHealthStatus, fetchDatasets, inspectDataset, generateDbtModel, publishToDataHub } from '../api/client';
import { DatasetMetadata, GeneratedArtifacts, WritebackResult } from '../types';
import { Header } from '../components/Header';
import { DatasetSelector } from '../components/DatasetSelector';
import { MetadataContextCard } from '../components/MetadataContextCard';
import { QualityScoreCard } from '../components/QualityScoreCard';
import { ReasoningCard } from '../components/ReasoningCard';
import { ArtifactsViewer } from '../components/ArtifactsViewer';
import { ValidationStatusCard } from '../components/ValidationStatusCard';
import { DataHubWritebackModal } from '../components/DataHubWritebackModal';
import { AIChatAssistant } from '../components/AIChatAssistant';
import { Sparkles, X, FileText, Layers, ShieldCheck, Brain, FileCode, MessageSquare } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [datasets, setDatasets] = useState<{ urn: string; name: string; platform: string; description?: string; domain?: string }[]>([]);
  const [selectedUrn, setSelectedUrn] = useState<string>('');
  const [secondaryUrn, setSecondaryUrn] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [artifacts, setArtifacts] = useState<GeneratedArtifacts | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResult, setPublishedResult] = useState<WritebackResult | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'context' | 'reasoning' | 'artifacts' | 'chat'>('context');

  const [showExamplesModal, setShowExamplesModal] = useState(false);
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
        setActiveTab('context');
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
      setActiveTab('artifacts');
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header demoMode={demoMode} onOpenExamples={() => setShowExamplesModal(true)} />

      <main className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full space-y-6">
        {errorMsg && (
          <div className="bg-rose-100 border border-rose-300 text-rose-900 p-4 rounded-2xl flex items-center justify-between text-xs shadow-md font-bold">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-900 font-bold ml-4 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Hero Dataset Selector with Multi-Dataset Join & Custom Instructions */}
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

        {/* Master Studio Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <div className="flex space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setActiveTab('context')}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-extrabold rounded-2xl transition border ${
                activeTab === 'context'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md font-mono'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>1. DataHub Context & Quality Score</span>
              {metadata?.quality_score && (
                <span className="ml-1 bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full font-mono text-[10px]">
                  {metadata.quality_score.overall_score}/100
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reasoning')}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-extrabold rounded-2xl transition border ${
                activeTab === 'reasoning'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md font-mono'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>2. Agent Reasoning & Logic</span>
              {artifacts && (
                <span className="ml-1 bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                  Ready
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('artifacts')}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-extrabold rounded-2xl transition border ${
                activeTab === 'artifacts'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md font-mono'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>3. Generated dbt Assets & Publish</span>
              {artifacts && (
                <span className="ml-1 bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                  ✓ Verified
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-extrabold rounded-2xl transition border ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md font-mono'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-300" />
              <span>4. 💬 AI Data Assistant Chat</span>
              <span className="ml-1 bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-mono text-[10px]">
                Interactive
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: DataHub Metadata Context & Quality Score */}
        {activeTab === 'context' && metadata && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <MetadataContextCard metadata={metadata} />
            </div>
            <div className="lg:col-span-5">
              <QualityScoreCard qualityScore={metadata.quality_score} />
            </div>
          </div>
        )}

        {/* Tab 2: Agent Reasoning & Decision Audit Log */}
        {activeTab === 'reasoning' && (
          <div className="space-y-6">
            {!artifacts && !isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-md">
                <Brain className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-900">No Reasoning Plan Generated Yet</h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                  Click <span className="text-slate-900 font-extrabold font-mono">"Generate dbt Pipeline"</span> above to trigger the metadata agent reasoning engine.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-md">
                <Sparkles className="w-10 h-10 text-sky-600 animate-spin mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  AI Agent Formulating Reasoning Plan
                </h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  Analyzing schema types → Deriving CTE transformations → Mapping dbt quality tests → Recording explicit engineering assumptions
                </p>
              </div>
            )}

            {artifacts && <ReasoningCard reasoning={artifacts.reasoning} />}
          </div>
        )}

        {/* Tab 3: Generated Artifacts Viewer & Publish */}
        {activeTab === 'artifacts' && (
          <div className="space-y-6">
            {!artifacts && !isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-md">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-900">Ready to Generate dbt Assets</h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                  Click <span className="text-slate-900 font-extrabold font-mono">"Generate dbt Pipeline"</span> above to build verified dbt SQL, schema tests, and documentation.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-md">
                <Sparkles className="w-10 h-10 text-sky-600 animate-spin mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Generating & Validating dbt Artifacts
                </h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  Writing executable SQL model → Formatting schema.yml → Running <span className="font-mono text-slate-900 font-bold">sqlglot</span> AST hallucination checks
                </p>
              </div>
            )}

            {artifacts && (
              <>
                <ValidationStatusCard
                  validation={artifacts.validation}
                  onPublish={handlePublish}
                  isPublishing={isPublishing}
                  published={!!publishedResult}
                />
                <ArtifactsViewer artifacts={artifacts} />
              </>
            )}
          </div>
        )}

        {/* Tab 4: AI Data Assistant Chat */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <AIChatAssistant metadata={metadata} />
          </div>
        )}
      </main>

      {/* Writeback Confirmation Modal */}
      {publishedResult && (
        <DataHubWritebackModal result={publishedResult} onClose={() => setPublishedResult(null)} />
      )}

      {/* Pre-built Examples Inspection Modal */}
      {showExamplesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Pre-built Technical Judge Examples</h3>
              </div>
              <button onClick={() => setShowExamplesModal(false)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-mono text-slate-900 font-bold">
                  <span>1. examples/orders/ (fct_orders)</span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">E-Commerce</span>
                </div>
                <p className="text-slate-700 font-medium">Canonical order transaction model deriving `order_value` via quantity * unit_price, explicitly highlighting missing currency metadata.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-mono text-slate-900 font-bold">
                  <span>2. examples/customers/ (dim_customers)</span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">CRM</span>
                </div>
                <p className="text-slate-700 font-medium">Customer dimension deriving full_name and clean_email while preserving undescribed country_code field.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-mono text-slate-900 font-bold">
                  <span>3. examples/revenue/ (monthly_revenue)</span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">Finance</span>
                </div>
                <p className="text-slate-700 font-medium">Monthly financial cohort aggregation model deducting promotional discounts.</p>
              </div>
            </div>

            <button
              onClick={() => setShowExamplesModal(false)}
              className="bg-slate-900 hover:bg-black text-white py-2.5 rounded-2xl text-xs font-extrabold shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
