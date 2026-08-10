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
import { AuthModal } from '../components/AuthModal';
import { Sparkles, X, FileText, Layers, ShieldCheck, Brain, FileCode, MessageSquare } from 'lucide-react';

interface DashboardProps {
  currentUser?: { name: string; email: string; role: string } | null;
  onSwitchToSentinel?: () => void;
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser: initialUser = null,
  onSwitchToSentinel,
  onLogout: externalLogout
}) => {
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(
    initialUser || {
      name: 'Mayank Parashar',
      email: 'mayank@fictionretail.com',
      role: 'Lead Analytics Engineer'
    }
  );
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
      <Header
        demoMode={demoMode}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={externalLogout || (() => setCurrentUser(null))}
        onOpenExamples={() => setShowExamplesModal(true)}
        onSwitchToSentinel={onSwitchToSentinel}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {errorMsg && (
          <div className="bg-rose-100 border border-rose-300 text-rose-900 p-4 rounded-2xl flex items-center justify-between text-xs shadow-md font-bold mb-4">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-900 font-bold ml-4 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Dataset Selector Card */}
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

        {/* Clean 4-Tab Navigation Bar */}
        <div className="border-b border-slate-200 pb-3 pt-1">
          <div className="flex space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setActiveTab('context')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'context'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>1. Metadata & Quality</span>
              {metadata?.quality_score && (
                <span className="bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full font-mono text-[10px]">
                  {metadata.quality_score.overall_score}/100
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reasoning')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'reasoning'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>2. AI Reasoning Plan</span>
              {artifacts && (
                <span className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                  Ready
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('artifacts')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'artifacts'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>3. Generated dbt Assets</span>
              {artifacts && (
                <span className="bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                  ✓ Verified
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-300" />
              <span>4. 💬 AI Chat Assistant</span>
            </button>
          </div>
        </div>

        {/* Tab 1: DataHub Metadata & Quality */}
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

        {/* Tab 2: AI Reasoning Plan */}
        {activeTab === 'reasoning' && (
          <div className="space-y-6">
            {!artifacts && !isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-sm">
                <Brain className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No Reasoning Plan Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Select a dataset above and click <span className="font-bold text-slate-800 font-mono">"Generate dbt Pipeline"</span> to view the AI agent's decision log.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
                <Sparkles className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">
                  Formulating Reasoning Plan...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Analyzing schema types → Deriving CTE transformations → Mapping dbt quality tests
                </p>
              </div>
            )}

            {artifacts && <ReasoningCard reasoning={artifacts.reasoning} />}
          </div>
        )}

        {/* Tab 3: Generated dbt Assets */}
        {activeTab === 'artifacts' && (
          <div className="space-y-6">
            {!artifacts && !isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-sm">
                <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Ready to Generate dbt Assets</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click <span className="font-bold text-slate-800 font-mono">"Generate dbt Pipeline"</span> to build verified dbt SQL, schema tests, and documentation.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
                <Sparkles className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">
                  Generating & Validating dbt Code...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Writing executable SQL model → Formatting schema.yml → Running <span className="font-mono text-slate-800 font-bold">sqlglot</span> AST hallucination checks
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

        {/* Tab 4: AI Chat Assistant */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Sample Technical Judge Examples</h3>
              </div>
              <button onClick={() => setShowExamplesModal(false)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-mono text-slate-900 font-bold">
                  <span>1. examples/orders/ (fct_orders)</span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">E-Commerce</span>
                </div>
                <p className="text-slate-600 font-medium">Order transaction model deriving `order_value` via quantity * unit_price, highlighting missing currency metadata.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-mono text-slate-900 font-bold">
                  <span>2. examples/customers/ (dim_customers)</span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">CRM</span>
                </div>
                <p className="text-slate-600 font-medium">Customer dimension deriving full_name and clean_email while preserving undescribed country_code field.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-mono text-slate-900 font-bold">
                  <span>3. examples/revenue/ (monthly_revenue)</span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">Finance</span>
                </div>
                <p className="text-slate-600 font-medium">Monthly financial cohort aggregation model deducting promotional discounts.</p>
              </div>
            </div>

            <button
              onClick={() => setShowExamplesModal(false)}
              className="bg-slate-900 hover:bg-black text-white py-2 rounded-xl text-xs font-bold shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Demo Sign Up / Sign In Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
};
