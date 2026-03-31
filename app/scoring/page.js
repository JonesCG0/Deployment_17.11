'use client'

import { useState } from 'react';
import { runScoringJob } from './actions';
import Link from 'next/link';
import { Zap, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function ScoringPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunScoring = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await runScoringJob();
      setResult(res);
    } catch (e) {
      setResult({ success: false, error: e.message });
    }
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-prussian-blue-950 dark:bg-prussian-blue-900 rounded-3xl p-8 text-silver-50 shadow-xl border border-prussian-blue-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10 text-cerulean-500 pointer-events-none">
          <Zap className="w-96 h-96" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Manual ML Scoring Trigger</h1>
          <p className="text-silver-300 max-w-2xl text-lg mb-8">
            This initiates the Python inference job to process unfulfilled orders, calculate their probability of arriving late, and update the database with predictions.
          </p>
  
          <button 
            onClick={handleRunScoring}
            disabled={isRunning}
            className="group bg-cerulean-500 hover:bg-cerulean-400 disabled:bg-prussian-blue-800 disabled:text-silver-400 text-prussian-blue-950 font-black px-8 py-4 rounded-xl shadow-lg transition-all active:scale-95 duration-200 flex items-center justify-center min-w-[240px] cursor-pointer focus:outline-none focus:ring-4 focus:ring-cerulean-500/50"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-prussian-blue-950/50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Run Scoring Job
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className={`mt-8 bg-card border border-border shadow-sm rounded-2xl overflow-hidden transition-all duration-300`}>
          <div className={`px-6 py-4 flex items-center border-b border-border ${result.success ? 'bg-cerulean-50 dark:bg-cerulean-950/30' : 'bg-lobster-pink-50 dark:bg-lobster-pink-950/30'}`}>
            {result.success ? (
              <CheckCircle2 className="w-8 h-8 text-cerulean-600 dark:text-cerulean-400 mr-3" />
            ) : (
              <XCircle className="w-8 h-8 text-lobster-pink-600 dark:text-lobster-pink-400 mr-3" />
            )}
            <h2 className={`text-xl font-bold ${result.success ? 'text-cerulean-900 dark:text-cerulean-300' : 'text-lobster-pink-900 dark:text-lobster-pink-300'}`}>
              {result.success ? 'Execution Successful' : 'Execution Failed'}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-prussian-blue-950 rounded-lg p-4 font-mono text-sm overflow-x-auto shadow-inner border-l-4 border-l-cerulean-500">
              <p className="text-silver-400 mb-2 font-semibold select-none">// stdout</p>
              <pre className="text-silver-100 break-all">{result.stdout || "No standard output generated."}</pre>
            </div>
            {(result.stderr || result.error) && (
              <div className="bg-prussian-blue-900/50 rounded-lg p-4 font-mono text-sm overflow-x-auto shadow-inner border-l-4 border-l-lobster-pink-500">
                <p className="text-lobster-pink-400 mb-2 font-semibold select-none">// error / stderr</p>
                <pre className="text-lobster-pink-300 break-all">{result.error}</pre>
                <pre className="text-lobster-pink-200 break-all mt-2">{result.stderr}</pre>
              </div>
            )}

            {result.success && (
              <div className="mt-8 flex justify-end">
                <Link href="/warehouse/priority" className="group flex items-center bg-cerulean-50 text-cerulean-700 hover:bg-cerulean-100 dark:bg-cerulean-900/40 dark:text-cerulean-300 dark:hover:bg-cerulean-900/60 font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer">
                  View Updated Priority Queue
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
