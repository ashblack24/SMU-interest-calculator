import React, { useState } from 'react';
import { Download, Copy, Check, ShieldCheck, ArrowRight, Printer, FileText } from 'lucide-react';
import { CalculationResult, LoanParameters } from '../types/sora';
import { formatSGD } from '../utils/soraMath';

interface HeroSummaryProps {
  result: CalculationResult;
  params: LoanParameters;
  onExportCsv: () => void;
  onExportMarkdown?: () => void;
}

export const HeroSummary: React.FC<HeroSummaryProps> = ({
  result,
  params,
  onExportCsv,
  onExportMarkdown,
}) => {
  const [copied, setCopied] = useState(false);

  const principalRatio = Math.round((params.loanAmount / (result.totalPayment || 1)) * 100);
  const interestRatio = 100 - principalRatio;

  const handleCopySummary = () => {
    const text = `--- Singapore SORA Mortgage Calculation Summary ---
Loan Amount: ${formatSGD(params.loanAmount)}
Tenure: ${params.tenureYears} Years (${params.tenureYears * 12} months)
Benchmark: ${params.rateType.replace('_', ' ').toUpperCase()} (${result.baseRate.toFixed(4)}% p.a.)
Bank Spread: +${result.spread.toFixed(2)}% p.a.
Effective Initial Rate: ${result.effectiveRate.toFixed(4)}% p.a.
Monthly Installment: ${formatSGD(result.monthlyInstallment, true)} / month
Total Interest Paid: ${formatSGD(result.totalInterestPaid, true)}
Total Repayment: ${formatSGD(result.totalPayment, true)}
MAS Stress Test (4.0% floor): ${formatSGD(result.stressTestInstallment, true)} / month
Convention: ${params.dayCountConvention}
Generated via SORA Engine`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            Payment Assessment
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Monthly Repayment & Interest Breakdown
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {onExportMarkdown && (
            <button
              type="button"
              onClick={onExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Export as Markdown (.md)"
            >
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              <span>Export .MD</span>
            </button>
          )}
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Stat Grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Installment */}
        <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Monthly Installment
            </span>
            <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-bold tracking-tight tabular-nums">
              {formatSGD(result.monthlyInstallment)}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-300 font-mono flex items-center justify-between border-t border-slate-800 pt-2">
            <span>Per calendar month</span>
            <span>{formatSGD(result.monthlyInstallment, true)}</span>
          </div>
        </div>

        {/* Effective Rate */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
              Effective Initial Rate
            </span>
            <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-tight tabular-nums">
              {result.effectiveRate.toFixed(4)}%
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200 pt-2">
            <span>SORA ({result.baseRate.toFixed(2)}%)</span>
            <span>+ Spread ({result.spread.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Total Interest Paid */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
              Total Interest Payable
            </span>
            <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-tight tabular-nums">
              {formatSGD(result.totalInterestPaid)}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200 pt-2">
            <span>Cost of credit</span>
            <span className="font-semibold text-slate-800">{interestRatio}% of total</span>
          </div>
        </div>

        {/* MAS Stress Test Installment */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                MAS Stress Test
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-tight tabular-nums">
              {formatSGD(result.stressTestInstallment)}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200 pt-2">
            <span>Tested at {result.stressTestRate.toFixed(2)}% floor</span>
            <span className="text-slate-700">TDSR check</span>
          </div>
        </div>
      </div>

      {/* Visual Amortization Proportion Bar */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">
            Total Loan Commitment: <span className="font-mono">{formatSGD(result.totalPayment)}</span>
          </span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-900"></span>
              Principal: {formatSGD(params.loanAmount)} ({principalRatio}%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
              Interest: {formatSGD(result.totalInterestPaid)} ({interestRatio}%)
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${principalRatio}%` }}
            className="h-full bg-slate-900 transition-all duration-300"
            title={`Principal: ${principalRatio}%`}
          />
          <div
            style={{ width: `${interestRatio}%` }}
            className="h-full bg-amber-500 transition-all duration-300"
            title={`Interest: ${interestRatio}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Singapore Banking Standard: {params.dayCountConvention} day-count compounding</span>
          <span>Tenure: {params.tenureYears} years ({params.tenureYears * 12} monthly cycles)</span>
        </div>
      </div>
    </div>
  );
};
