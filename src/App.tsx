/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import JSON5 from 'json5';
import { JsonNode } from './components/JsonTree';
import { FileJson, Braces, Trash2, Copy, Check, ArrowRightLeft, FoldVertical, UnfoldVertical } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_JSON5 = `{
  // Welcome to JSON5 Visualizer!
  // Comments are allowed.
  appName: "JSON5 Visualizer",
  version: 1.0,
  features: [
    "Validation",
    "Visualization",
    "Conversion"
  ],
  // Trailing commas? No problem.
  settings: {
    theme: 'light',
    autoParse: true,
  },
  hexadecimal: 0xDECADE,
  leadingDecimal: .8675309, 
  andTrailing: 8675309.,
  positiveSign: +1,
  "quoted keys": "are optional",
}`;

export default function App() {
  const [input, setInput] = useState(DEFAULT_JSON5);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandSignal, setExpandSignal] = useState(0);
  const [collapseSignal, setCollapseSignal] = useState(0);

  useEffect(() => {
    try {
      if (!input.trim()) {
        setParsedData(null);
        setError(null);
        return;
      }
      const parsed = JSON5.parse(input);
      setParsedData(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Keep the old data if possible, or maybe clear it? 
      // Let's keep old data visible but maybe dimmed? 
      // Actually clearing it avoids confusion about what is currently valid.
      // But for typing experience, maybe we just show error.
    }
  }, [input]);

  const handleCopyJson = () => {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON5.parse(input);
      // Format as standard JSON5 (using JSON5.stringify if available, or just standard JSON)
      // JSON5.stringify isn't always pretty print by default in the same way, let's use standard JSON for "Convert to JSON"
      // But if we want to format the *Input* as JSON5, we might need a formatter.
      // For now, let's offer "Convert to JSON" which replaces the input.
      setInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // ignore
    }
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <FileJson size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              JSON5 <span className="text-slate-500 font-normal">Visualizer</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <a href="https://json5.org/" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">
              What is JSON5?
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          
          {/* Input Section */}
          <section className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Braces size={16} className="text-slate-400" />
                Input (JSON5)
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleFormat}
                  disabled={!!error || !parsedData}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Convert to Standard JSON"
                >
                  <ArrowRightLeft size={16} />
                </button>
                <button 
                  onClick={handleClear}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Clear"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="relative flex-1 flex overflow-hidden">
              <div 
                className="w-12 bg-slate-50 border-r border-slate-100 text-right pr-3 py-4 font-mono text-sm text-slate-400 select-none overflow-hidden"
                aria-hidden="true"
              >
                {input.split('\n').map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onScroll={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  const lineNumbers = target.previousElementSibling as HTMLDivElement;
                  if (lineNumbers) {
                    lineNumbers.scrollTop = target.scrollTop;
                  }
                }}
                className="flex-1 w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-transparent leading-6 whitespace-pre"
                placeholder="// Paste your JSON5 here..."
                spellCheck={false}
              />
            </div>
            
            {/* Error Area (Sticky at bottom of input) */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-red-100 bg-red-50"
                >
                  <div className="p-4 text-red-600 text-sm font-mono flex items-start gap-2">
                    <span className="mt-0.5 select-none">⚠️</span>
                    <span className="whitespace-pre-wrap">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Visualization Section */}
          <section className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileJson size={16} className="text-slate-400" />
                Visualizer
              </div>
              {parsedData && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandSignal(s => s + 1)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Expand All"
                  >
                    <UnfoldVertical size={16} />
                  </button>
                  <button
                    onClick={() => setCollapseSignal(s => s + 1)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Collapse All"
                  >
                    <FoldVertical size={16} />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button 
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 bg-white custom-scrollbar">
              {parsedData ? (
                <JsonNode 
                  value={parsedData} 
                  isLast={true} 
                  initiallyExpanded={true}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <Braces size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm">Enter valid JSON5 to visualize</p>
                </div>
              )}
            </div>
          </section>

        </div>
        
        <footer className="text-center text-xs text-slate-400">
          <p>Built with React, Tailwind CSS, and JSON5</p>
        </footer>
      </main>
    </div>
  );
}

