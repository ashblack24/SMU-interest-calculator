/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  LoanParameters,
  BorrowerProfile,
  MASApiConfig,
  MASRateRecord,
} from './types/sora';
import {
  loadMasConfig,
  saveMasConfig,
  fetchMasSoraRates,
  FALLBACK_MAS_RECORDS,
} from './services/masApi';
import { calculateSoraLoan, formatSGD } from './utils/soraMath';
import { Header } from './components/Header';
import { HeroSummary } from './components/HeroSummary';
import { LoanInputForm } from './components/LoanInputForm';
import { AmortizationTable } from './components/AmortizationTable';
import { RateTrendChart } from './components/RateTrendChart';
import { TdsrCalculator } from './components/TdsrCalculator';
import { MasConfigModal } from './components/MasConfigModal';
import { BackendGuideModal } from './components/BackendGuideModal';
import {
  Info,
  Key,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [masConfig, setMasConfig] = useState<MASApiConfig>(loadMasConfig);
  const [records, setRecords] = useState<MASRateRecord[]>(FALLBACK_MAS_RECORDS);
  const [isFallback, setIsFallback] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'calculator' | 'trends' | 'tdsr' | 'backend-guide'>('calculator');
  const [isMasModalOpen, setIsMasModalOpen] = useState(false);
  const [isBackendGuideOpen, setIsBackendGuideOpen] = useState(false);

  // Loan parameters
  const [loanParams, setLoanParams] = useState<LoanParameters>({
    loanAmount: 750000,
    tenureYears: 25,
    rateType: '3m_compounded',
    bankSpread: 0.70,
    isTiered: false,
    tieredSpreads: [
      { fromYear: 1, toYear: 2, spread: 0.65 },
      { fromYear: 3, toYear: 99, spread: 0.85 },
    ],
    manualRate: 3.15,
    stressTestRate: 4.0,
    dayCountConvention: 'ACT/365',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Borrower profile
  const [borrowerProfile, setBorrowerProfile] = useState<BorrowerProfile>({
    grossMonthlyIncome: 12000,
    otherMonthlyDebts: 1200,
    propertyType: 'HDB',
    isFirstProperty: true,
  });

  // Latest MAS record
  const latestRecord = records[0] || FALLBACK_MAS_RECORDS[0];

  // Primary calculation
  const calculationResult = useMemo(() => {
    return calculateSoraLoan(loanParams, latestRecord, borrowerProfile);
  }, [loanParams, latestRecord, borrowerProfile]);

  // Initial fetch attempt
  useEffect(() => {
    refreshRates(masConfig);
  }, []);

  const refreshRates = async (cfg: MASApiConfig) => {
    setIsRefreshing(true);
    const result = await fetchMasSoraRates(cfg);
    setIsRefreshing(false);

    setRecords(result.records);
    setIsFallback(result.isFallback);
    setLastSyncStatus(result.statusText);

    const updated = {
      ...cfg,
      lastFetchedAt: new Date().toISOString(),
      status: (result.isFallback ? 'fallback' : 'connected') as any,
    };
    setMasConfig(updated);
    saveMasConfig(updated);
  };

  const handleSaveConfig = (newConfig: MASApiConfig) => {
    setMasConfig(newConfig);
    saveMasConfig(newConfig);
    refreshRates(newConfig);
  };

  // CSV Exporter
  const handleExportCsv = () => {
    const headers = [
      'Month',
      'Date',
      'Year',
      'Base SORA (%)',
      'Bank Spread (%)',
      'Effective Rate (%)',
      'Monthly Installment (SGD)',
      'Principal Paid (SGD)',
      'Interest Paid (SGD)',
      'Remaining Balance (SGD)',
    ];

    const rows = calculationResult.monthlySchedule.map((m) => [
      m.period,
      m.date,
      `Year ${m.yearNumber}`,
      m.baseRate.toFixed(4),
      m.spread.toFixed(2),
      m.effectiveRate.toFixed(4),
      m.monthlyInstallment.toFixed(2),
      m.principalPaid.toFixed(2),
      m.interestPaid.toFixed(2),
      m.remainingBalance.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sora_amortization_${loanParams.loanAmount}_sgd.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMarkdown = () => {
    const mdLines = [
      '# Singapore SORA Mortgage Calculation Report',
      '',
      `> Generated on: ${new Date().toISOString()} via Singapore SORA Financial Engine`,
      `> Benchmark Authority: Monetary Authority of Singapore (MAS)`,
      '',
      '## 1. Executive Summary',
      '',
      `- **Loan Principal**: ${formatSGD(loanParams.loanAmount)}`,
      `- **Loan Tenure**: ${loanParams.tenureYears} Years (${loanParams.tenureYears * 12} Monthly Installments)`,
      `- **Benchmark SORA Metric**: ${loanParams.rateType.replace('_', ' ').toUpperCase()} (${calculationResult.baseRate.toFixed(4)}% p.a.)`,
      `- **Bank Spread**: +${calculationResult.spread.toFixed(2)}% p.a.`,
      `- **Effective Initial Rate**: ${calculationResult.effectiveRate.toFixed(4)}% p.a.`,
      `- **Day Count Convention**: ${loanParams.dayCountConvention} (Singapore Standard)`,
      `- **Monthly Installment**: **${formatSGD(calculationResult.monthlyInstallment, true)} / month**`,
      `- **Total Interest Payable**: ${formatSGD(calculationResult.totalInterestPaid, true)}`,
      `- **Total Cumulative Repayment**: ${formatSGD(calculationResult.totalPayment, true)}`,
      `- **MAS Regulatory Stress Test (4.00% Floor)**: ${formatSGD(calculationResult.stressTestInstallment, true)} / month`,
      '',
      '## 2. Benchmark Reference Rates (MAS Statistical Bulletin)',
      '',
      `| Metric | Rate (% p.a.) | Publication Reference |`,
      `| :--- | :--- | :--- |`,
      `| Daily SORA | ${latestRecord.sora.toFixed(4)}% | Published 9:00 AM SGT |`,
      `| 1-Month Compounded SORA | ${latestRecord.sora_compound_1m.toFixed(4)}% | Rolling 1M ACT/365 |`,
      `| 3-Month Compounded SORA | ${latestRecord.sora_compound_3m.toFixed(4)}% | Industry Standard |`,
      `| 6-Month Compounded SORA | ${latestRecord.sora_compound_6m.toFixed(4)}% | Rolling 6M ACT/365 |`,
      `| MAS SORA Index | ${latestRecord.sora_index ? latestRecord.sora_index.toFixed(5) : 'N/A'} | Compounding Index |`,
      '',
      '## 3. Full Amortization Schedule',
      '',
      '| Month | Date | Payment (SGD) | Principal (SGD) | Interest (SGD) | Remaining Balance (SGD) |',
      '| :---: | :---: | :---: | :---: | :---: | :---: |',
      ...calculationResult.monthlySchedule.map(
        (m) =>
          `| ${m.period} | ${m.date} | $${m.monthlyInstallment.toFixed(2)} | $${m.principalPaid.toFixed(2)} | $${m.interestPaid.toFixed(2)} | $${m.remainingBalance.toFixed(2)} |`
      ),
      '',
      '---',
      '*Notice: Interest calculations follow standard MAS ACT/365 day count convention. Regulatory stress testing complies with MAS Notice 645 Total Debt Servicing Ratio (TDSR) guidelines.*',
    ];

    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sora_mortgage_report_${loanParams.loanAmount}_sgd.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        masConfig={masConfig}
        onOpenMasModal={() => setIsMasModalOpen(true)}
        onOpenBackendGuide={() => setIsBackendGuideOpen(true)}
        onRefreshRates={() => refreshRates(masConfig)}
        isRefreshing={isRefreshing}
        current3mSora={latestRecord.sora_compound_3m}
        lastRecordDate={latestRecord.date}
      />

      {/* Informational Benchmark Notice Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              MAS Daily Benchmark: <strong>3M SORA at {latestRecord.sora_compound_3m.toFixed(4)}%</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="hidden sm:inline">ACT/365 Day Count Convention</span>
            <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
            <span className="hidden md:inline">MAS Notice 645 TDSR Regulatory Floor: 4.00%</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>
              Header: <span className="text-slate-200">KeyId: {masConfig.apiKey || '<MAS_KEY_ID>'}</span>
            </span>
            <button
              onClick={() => setIsMasModalOpen(true)}
              className="text-slate-300 hover:text-white underline font-sans"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Dynamic Tab Switcher */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Top Hero Summary */}
            <HeroSummary
              result={calculationResult}
              params={loanParams}
              onExportCsv={handleExportCsv}
              onExportMarkdown={handleExportMarkdown}
            />

            {/* Two-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Loan Parameters Form */}
              <div className="lg:col-span-5 space-y-6">
                <LoanInputForm
                  params={loanParams}
                  onChange={setLoanParams}
                  latestRecord={latestRecord}
                />

                {/* Quick SORA Educational Guide */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                    <Info className="w-4 h-4 text-slate-700" />
                    <span>How SORA Mortgages Work in Singapore</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>SORA (Singapore Overnight Rate Average)</strong> is the volume-weighted average rate of unsecured SGD overnight interbank transactions administered by the Monetary Authority of Singapore.
                    </li>
                    <li>
                      <strong>3M Compounded SORA</strong> is the prevailing standard for home loans offered by Singapore banks (DBS, OCBC, UOB). Rates are compounded daily over a 90-day rolling lookback window.
                    </li>
                    <li>
                      <strong>ACT/365 Convention:</strong> Singapore financial institutions calculate daily interest using the exact days of the month divided by 365 days.
                    </li>
                    <li>
                      <strong>MAS Notice 645/1115:</strong> Financial institutions must compute Total Debt Servicing Ratio (TDSR) against a 4.0% interest rate floor (or current rate + 0.5%, whichever is higher).
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Amortization Schedule & Principal Curve */}
              <div className="lg:col-span-7 space-y-6">
                <AmortizationTable
                  monthlySchedule={calculationResult.monthlySchedule}
                  yearlySchedule={calculationResult.yearlySchedule}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <RateTrendChart
              records={records}
              isFallback={isFallback}
            />
          </div>
        )}

        {activeTab === 'tdsr' && (
          <div className="space-y-6">
            <TdsrCalculator
              borrower={borrowerProfile}
              onChangeBorrower={setBorrowerProfile}
              result={calculationResult}
              params={loanParams}
            />
          </div>
        )}

        {activeTab === 'backend-guide' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Architecture & Integration
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                MAS API Gateway Backend Handoff Guide
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You asked for the frontend first and noted that you will integrate the backend later with the mandatory header: <span className="font-mono font-semibold text-slate-900">KeyId: &lt;MAS_KEY_ID&gt;</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-800 block">1. Set Up Proxy Route</span>
                <p className="text-xs text-slate-600 mt-1">
                  Create a server-side route (e.g. <span className="font-mono">/api/sora</span>) to query MAS without client-side CORS issues.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-800 block">2. Inject Header</span>
                <p className="text-xs text-slate-600 mt-1">
                  Attach header <span className="font-mono">KeyId: process.env.MAS_KEY_ID</span> to all upstream calls to <span className="font-mono">eservices.mas.gov.sg</span>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-800 block">3. Connect Calculator</span>
                <p className="text-xs text-slate-600 mt-1">
                  Set the Endpoint URL in this calculator's settings to your route. Rates will automatically stream in real-time.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsBackendGuideOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                <span>Open Full Code Snippets (Express, cURL, Python)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SORA Engine</span>
            <span>·</span>
            <span>Monetary Authority of Singapore (MAS) Benchmark Rates</span>
            <span>·</span>
            <span>ACT/365 Compound Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px] font-mono">
            <span>Header: KeyId: {masConfig.apiKey ? 'Configured' : '<MAS_KEY_ID>'}</span>
            <span>·</span>
            <button
              onClick={() => setIsBackendGuideOpen(true)}
              className="hover:text-slate-900 underline font-sans"
            >
              API Docs
            </button>
          </div>
        </div>
      </footer>

      {/* MAS KeyId & Gateway Modal */}
      <MasConfigModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
        config={masConfig}
        onSaveConfig={handleSaveConfig}
        onSyncComplete={() => {}}
      />

      {/* Backend Integration Guide Modal */}
      <BackendGuideModal
        isOpen={isBackendGuideOpen}
        onClose={() => setIsBackendGuideOpen(false)}
        config={masConfig}
      />
    </div>
  );
}
