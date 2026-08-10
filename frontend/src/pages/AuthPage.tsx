import React, { useState } from 'react';
import { 
  Sparkles, Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, Play, 
  CheckCircle2, Zap, Shield, Cpu, Key, Video, Star, Award, 
  CheckCheck, Server, Database, Activity, Flame
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
  onSkipToDemo: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onSkipToDemo }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@datacorp.io');
  const [role, setRole] = useState('Lead Analytics Engineer');
  const [password, setPassword] = useState('sentinelSecure2026!');
  
  const [videoSrc, setVideoSrc] = useState<string>('/demo.mp4');
  const [videoError, setVideoError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: name || 'Alex Morgan',
      email: email || 'alex.morgan@datacorp.io',
      role: role || 'Lead Analytics Engineer'
    });
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Security & Compliance Announcement Bar */}
      <div className="bg-slate-955 border-b border-slate-800/80 px-8 py-2.5 text-xs font-mono flex flex-wrap items-center justify-between gap-4 text-slate-400">
        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>SOC2 Type II Certified</span>
          </span>
          <span className="flex items-center space-x-1.5 text-cyan-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
            <span>GDPR & HIPAA Compliant</span>
          </span>
          <span className="hidden md:flex items-center space-x-1.5 text-slate-300 font-bold">
            <CheckCheck className="w-3.5 h-3.5 text-indigo-400 inline" />
            <span>256-Bit AES Encryption</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-slate-400">Trusted by 500+ Enterprise Data Teams</span>
          <div className="flex items-center space-x-1 text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-white text-xs ml-1 font-bold">4.9/5</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[#070A11]/90 backdrop-blur-md px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 overflow-hidden shadow-lg shadow-cyan-500/10 p-0.5 shrink-0">
              <img src="/logo.jpg" alt="DataSentinel Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                  Data<span className="text-cyan-400">Sentinel</span>
                </h1>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  SECURITY CENTER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                AI Data Intelligence & Governance Platform
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Organized Grid Layout */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Product Vision, Video Showcase & Integrations */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Headline & Vision */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enterprise AI Governance & Zero-Trust Security</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Data Intelligence & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">Autonomous Sentinel Shield</span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl font-medium">
              DataSentinel continuously monitors DataHub datasets, detects anomalies, evaluates schema quality (0–100 score), enforces zero AST hallucinations, and publishes merge-ready dbt pipelines back into DataHub.
            </p>
          </div>

          {/* Seamless Continuous Video Showcase */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-3 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="relative aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner group">
              {!videoError ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover rounded-2xl pointer-events-none"
                >
                  <source src={videoSrc} type="video/mp4" />
                  <source src="/demo.webm" type="video/webm" />
                  Your browser does not support HTML5 video.
                </video>
              ) : (
                <div className="text-center space-y-3 p-6 z-10">
                  <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/40 rounded-full flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                    <Video className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Watch DataSentinel Command Center Demo</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    See Metadata Quality Scoring, <span className="text-cyan-400 font-mono">sqlglot</span> AST validation, and DataHub Glossary Semantic Type Checking in action.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Clean Redesigned Metrics Grid with Extra Spacing & Padding */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-slate-900/90 border border-cyan-500/25 p-6 rounded-2xl space-y-2.5 shadow-xl backdrop-blur-md hover:border-cyan-500/40 transition duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">AST Verification</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl font-mono font-extrabold text-cyan-400 tracking-tight">100% Green</div>
              <div className="text-xs text-cyan-300/90 font-medium flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 inline shrink-0" />
                <span>Zero Code Hallucinations</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/25 p-6 rounded-2xl space-y-2.5 shadow-xl backdrop-blur-md hover:border-emerald-500/40 transition duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Service Uptime</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-mono font-extrabold text-emerald-400 tracking-tight">99.99% SLA</div>
              <div className="text-xs text-emerald-300/90 font-medium flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline shrink-0" />
                <span>Enterprise High Availability</span>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <div className="flex items-center space-x-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "DataSentinel eliminated 100% of broken dbt deployments across our 50+ data pipelines. The AST hallucination guard and DataHub glossary validation are game-changers for enterprise analytics engineering."
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-xs">
                AM
              </div>
              <div>
                <div className="text-xs font-bold text-white">Alex Morgan</div>
                <div className="text-[10px] text-slate-400">Lead Analytics Engineer — Global Retail Data Corp</div>
              </div>
            </div>
          </div>

          {/* Connectors & Integrations */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Native Enterprise Data Connectors
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {['DataHub GMS', 'Snowflake', 'Google BigQuery', 'PostgreSQL', 'dbt Core & Cloud', 'Databricks Iceberg'].map((platform) => (
                <span key={platform} className="bg-slate-900 border border-slate-800 text-slate-300 px-3.5 py-1.5 rounded-xl font-mono font-semibold flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{platform}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clean Organized Workspace Authentication Card */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
            
            {/* Form Header */}
            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {isSignUp ? 'Create Workspace' : 'Sign In'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Enter your details to launch your DataSentinel workspace
              </p>
            </div>

            {/* Structured Pre-Filled Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              {isSignUp && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.morgan@datacorp.io"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Engineering Role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
                    >
                      <option value="Lead Analytics Engineer" className="bg-slate-900 text-white">Lead Analytics Engineer</option>
                      <option value="Staff Data Platform Engineer" className="bg-slate-900 text-white">Staff Data Platform Engineer</option>
                      <option value="Head of Data Governance" className="bg-slate-900 text-white">Head of Data Governance</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 text-xs hover:scale-[1.01] mt-2"
              >
                <span>{isSignUp ? 'Enter Sentinel Workspace' : 'Sign In to Command Center'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>

            {/* Auth Mode Toggle Switch */}
            <div className="text-center text-xs text-slate-400 font-medium pt-2">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => setIsSignUp(false)} className="text-cyan-400 font-bold hover:underline">
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Need an account?{' '}
                  <button onClick={() => setIsSignUp(true)} className="text-cyan-400 font-bold hover:underline">
                    Create Account
                  </button>
                </span>
              )}
            </div>

            {/* Organized Footer Trust Badges */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted</span>
              </span>
              <span>Zero Warehouse Retention</span>
              <span className="flex items-center space-x-1 text-cyan-400 font-semibold">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enterprise SLA</span>
              </span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};
