import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, Info, Calculator, CheckCircle2 } from 'lucide-react';
import { BorrowerProfile, CalculationResult, LoanParameters } from '../types/sora';
import { formatSGD } from '../utils/soraMath';

interface TdsrCalculatorProps {
  borrower: BorrowerProfile;
  onChangeBorrower: (updated: BorrowerProfile) => void;
  result: CalculationResult;
  params: LoanParameters;
}

export const TdsrCalculator: React.FC<TdsrCalculatorProps> = ({
  borrower,
  onChangeBorrower,
  result,
  params,
}) => {
  const update = (patch: Partial<BorrowerProfile>) => {
    onChangeBorrower({ ...borrower, ...patch });
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
    update({ grossMonthlyIncome: val });
  };

  const handleDebtsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
    update({ otherMonthlyDebts: val });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
          MAS Regulatory Affordability
        </span>
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Total Debt Servicing Ratio (TDSR) & MSR Assessment
        </h3>
        <p className="text-xs text-slate-500">
          Evaluated against MAS statutory rules (TDSR ≤ 55%, MSR ≤ 30% for HDB/EC, tested at 4.0% floor)
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Income */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Gross Monthly Income (SGD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-mono font-semibold text-slate-400">
              S$
            </span>
            <input
              type="text"
              value={borrower.grossMonthlyIncome ? borrower.grossMonthlyIncome.toLocaleString('en-SG') : ''}
              onChange={handleIncomeChange}
              placeholder="12,000"
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Fixed salary + 70% of variable income/bonuses
          </p>
        </div>

        {/* Other Debts */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Other Monthly Debt Commitments
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-mono font-semibold text-slate-400">
              S$
            </span>
            <input
              type="text"
              value={borrower.otherMonthlyDebts ? borrower.otherMonthlyDebts.toLocaleString('en-SG') : ''}
              onChange={handleDebtsChange}
              placeholder="1,200"
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Car loans, personal loans, credit card minimums
          </p>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Property Category
          </label>
          <select
            value={borrower.propertyType}
            onChange={(e) => update({ propertyType: e.target.value as any })}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="HDB">HDB Flat (Subject to 30% MSR + 55% TDSR)</option>
            <option value="EC">Executive Condominium (Subject to MSR + TDSR)</option>
            <option value="PRIVATE">Private Residential (Subject to 55% TDSR)</option>
          </select>
          <p className="text-[10px] text-slate-400 mt-1">
            Determines statutory MSR application
          </p>
        </div>
      </div>

      {/* Ratios Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TDSR Card */}
        <div className={`p-4 rounded-xl border ${
          result.isTdsrPass 
            ? 'bg-slate-50 border-slate-200' 
            : 'bg-rose-50/50 border-rose-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  TDSR Ratio (55% Cap)
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-3xl font-mono font-bold tabular-nums ${
                  result.isTdsrPass ? 'text-slate-900' : 'text-rose-700'
                }`}>
                  {result.tdsrRatio}%
                </span>
                <span className="text-xs font-mono text-slate-500">
                  / 55.0% Limit
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
              result.isTdsrPass 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {result.isTdsrPass ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Compliant</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Exceeds Limit</span>
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, (result.tdsrRatio / 55) * 100)}%` }}
              className={`h-full transition-all duration-300 ${
                result.isTdsrPass ? 'bg-slate-900' : 'bg-rose-600'
              }`}
            />
          </div>

          <div className="mt-3 text-[11px] text-slate-500 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Stress-tested mortgage (at {result.stressTestRate}%):</span>
              <span className="font-semibold text-slate-800">{formatSGD(result.stressTestInstallment)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other debt commitments:</span>
              <span className="font-semibold text-slate-800">{formatSGD(borrower.otherMonthlyDebts)}</span>
            </div>
          </div>
        </div>

        {/* MSR Card (If applicable) */}
        {borrower.propertyType !== 'PRIVATE' ? (
          <div className={`p-4 rounded-xl border ${
            result.isMsrPass 
              ? 'bg-slate-50 border-slate-200' 
              : 'bg-rose-50/50 border-rose-200'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  MSR Ratio (30% Cap)
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-3xl font-mono font-bold tabular-nums ${
                    result.isMsrPass ? 'text-slate-900' : 'text-rose-700'
                  }`}>
                    {result.msrRatio}%
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    / 30.0% Limit
                  </span>
                </div>
              </div>

              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                result.isMsrPass 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {result.isMsrPass ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Compliant</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Exceeds Limit</span>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, ((result.msrRatio || 0) / 30) * 100)}%` }}
                className={`h-full transition-all duration-300 ${
                  result.isMsrPass ? 'bg-slate-900' : 'bg-rose-600'
                }`}
              />
            </div>

            <div className="mt-3 text-[11px] text-slate-500 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Monthly mortgage installment:</span>
                <span className="font-semibold text-slate-800">{formatSGD(result.monthlyInstallment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum 30% threshold:</span>
                <span className="font-semibold text-slate-800">{formatSGD(borrower.grossMonthlyIncome * 0.3)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                MSR Exemption
              </span>
              <div className="mt-1 text-base font-semibold text-slate-900">
                Not Applicable (Private Property)
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Under MAS rules, Mortgage Servicing Ratio (MSR) applies only to HDB flats and Executive Condominiums purchased directly from developers. Private residential purchases are evaluated solely on the 55% TDSR limit.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              MAS Notice 645 Framework
            </div>
          </div>
        )}
      </div>

      {/* Max Borrowing Capacity Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
            Estimated Max Loan Capacity
          </span>
          <div className="text-2xl font-mono font-bold tracking-tight mt-0.5 tabular-nums">
            {formatSGD(result.maxAffordableLoan)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Based on your monthly income of {formatSGD(borrower.grossMonthlyIncome)} over {params.tenureYears} years with MAS 4.0% stress test.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono text-slate-400 block">Current Request</span>
          <span className="text-lg font-mono font-semibold text-white block tabular-nums">
            {formatSGD(params.loanAmount)}
          </span>
          <span className={`text-xs font-medium ${
            params.loanAmount <= result.maxAffordableLoan ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {params.loanAmount <= result.maxAffordableLoan ? 'Within Capacity' : 'Exceeds Maximum'}
          </span>
        </div>
      </div>
    </div>
  );
};
