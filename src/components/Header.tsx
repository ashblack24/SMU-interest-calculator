import React from 'react';
import { SlidersHorizontal, Key, RefreshCw, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MASApiConfig } from '../types/sora';

interface HeaderProps {
  activeTab: 'calculator' | 'trends' | 'tdsr' | 'backend-guide';
  setActiveTab: (tab: 'calculator' | 'trends' | 'tdsr' | 'backend-guide') => void;
  masConfig: MASApiConfig;
  onOpenMasModal: () => void;
  onOpenBackendGuide: () => void;
  onRefreshRates: () => void;
  isRefreshing: boolean;
  current3mSora: number;
  lastRecordDate: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  masConfig,
  onOpenMasModal,
  onOpenBackendGuide,
  onRefreshRates,
  isRefreshing,
  current3mSora,
  lastRecordDate,
}) => {
  const hasKey = Boolean(masConfig.apiKey && masConfig.apiKey.trim().length > 0);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('calculator')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white font-mono font-bold text-sm tracking-tight shadow-xs">
                SG
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                  SORA Engine
                </span>
                <span className="text-[11px] text-slate-500 font-mono tracking-tight block">
                  MAS Singapore Overnight Rate
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'calculator'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Loan Calculator
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'trends'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              MAS Rates & Trends
            </button>
            <button
              onClick={() => setActiveTab('tdsr')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'tdsr'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              TDSR & MSR Affordability
            </button>
            <button
              onClick={() => setActiveTab('backend-guide')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'backend-guide'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Backend API Handoff
            </button>
          </nav>

          {/* Zone 3: Primary actions & MAS configuration */}
          <div className="flex items-center gap-2.5">
            {/* Live MAS rate indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500 font-mono">3M SORA:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {current3mSora.toFixed(4)}%
              </span>
              <span className="text-slate-400 text-[10px] font-mono">
                ({lastRecordDate})
              </span>
            </div>

            {/* Refresh Rates button */}
            <button
              onClick={onRefreshRates}
              disabled={isRefreshing}
              title="Refresh MAS Rates"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`} />
            </button>

            {/* MAS KeyId settings button */}
            <button
              onClick={onOpenMasModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                hasKey
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">MAS KeyId</span>
              {hasKey ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="text-[10px] text-amber-600 font-semibold">(Config)</span>
              )}
            </button>

            {/* Backend Integration button */}
            <button
              onClick={onOpenBackendGuide}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Backend Handoff</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-100 py-2 overflow-x-auto gap-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Loan Calculator
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'trends'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            MAS Rates
          </button>
          <button
            onClick={() => setActiveTab('tdsr')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'tdsr'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            TDSR / MSR
          </button>
          <button
            onClick={() => setActiveTab('backend-guide')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'backend-guide'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            API Code
          </button>
        </div>
      </div>
    </header>
  );
};
