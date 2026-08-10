11import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { DatasetMetadata } from '../types';
import { sendChatMessage } from '../api/client';

interface AIChatAssistantProps {
  metadata: DatasetMetadata | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ metadata }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: metadata
        ? `Hello! I am your **DataHub AI Data Assistant**.\n\nI am currently context-loaded with dataset **\`${metadata.name}\`** (\`${metadata.platform}\`).\n\nAsk me anything about quality scores, metadata gaps, column definitions, lineage, or dbt model recommendations!`
        : `Hello! Select a dataset above to start auditing and asking questions about your DataHub metadata catalog.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultSuggestions = metadata
    ? [
        `Explain quality score for ${metadata.name}`,
        `Show lineage graph for ${metadata.name}`,
        `List all columns in ${metadata.name}`,
        `Suggest dbt model strategy`
      ]
    : [
        'How does DataHub quality scoring work?',
        'What datasets are available?',
        'How are dbt models validated?'
      ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || !metadata || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(metadata.urn, query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error contacting AI Assistant: ${err.message || 'Server error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
      {/* Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              AI Data Assistant
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Metadata Context Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {metadata ? `Context: ${metadata.name} (${metadata.platform})` : 'Select a dataset above'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-blue-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
              <div
                className={`text-[10px] mt-2 ${
                  msg.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs">
            <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-400 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Analyzing DataHub metadata context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-slate-900/50 border-t border-slate-800/80 px-4 py-2 flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 self-center flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Ask:
        </span>
        {defaultSuggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSend(sug)}
            disabled={loading || !metadata}
            className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60 transition-colors disabled:opacity-50"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            metadata
              ? `Ask about ${metadata.name} schema, quality score, or dbt model...`
              : 'Select a dataset to ask questions...'
          }
          disabled={!metadata || loading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || !metadata || loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
