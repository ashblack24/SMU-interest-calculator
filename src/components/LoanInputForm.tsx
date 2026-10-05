import React from 'react';
import {
  Building2,
  Calendar,
  Percent,
  TrendingUp,
  RotateCcw,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';
import { LoanParameters, MASRateRecord, SoraRateType, TieredSpread } from '../types/sora';
import { formatSGD } from '../utils/soraMath';

interface LoanInputFormProps {
  params: LoanParameters;
  onChange: (updated: LoanParameters) => void;
  latestRecord: MASRateRecord;
}

const PROPERTY_PRESETS = [
  { label: '4-Room HDB', amount: 450000, tenure: 25 },
  { label: '5-Room Resale', amount: 720000, tenure: 25 },
  { label: 'Exec Condo', amount: 1200000, tenure: 30 },
  { label: 'Private Condo', amount: 1650000, tenure: 30 },
  { label: 'Landed', amount: 3200000, tenure: 30 },
];

export const LoanInputForm: React.FC<LoanInputFormProps> = ({
  params,
  onChange,
  latestRecord,
}) => {
  const update = (patch: Partial<LoanParameters>) => {
    onChange({ ...params, ...patch });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(val, 10) || 0;
    update({ loanAmount: num });
  };

  const adjustAmount = (delta: number) => {
    const next = Math.max(50000, Math.min(20000000, params.loanAmount + delta));
    update({ loanAmount: next });
  };

  const setPreset = (preset: typeof PROPERTY_PRESETS[0]) => {
    update({
      loanAmount: preset.amount,
      tenureYears: preset.tenure,
    });
  };

  // Tiered spreads helper
  const handleTierChange = (index: number, newSpread: number) => {
    const newTiers = [...params.tieredSpreads];
    newTiers[index] = { ...newTiers[index], spread: newSpread };
    update({ tieredSpreads: newTiers });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Loan Parameters & SORA Package
          </h2>
          <p className="text-xs text-slate-500">
            Configure Singapore mortgage amount, tenure, and bank margin
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            update({
              loanAmount: 750000,
              tenureYears: 25,
              rateType: '3m_compounded',
              bankSpread: 0.70,
              isTiered: false,
              dayCountConvention: 'ACT/365',
              stressTestRate: 4.0,
            });
          }}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
          title="Reset to typical Singapore default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Property Presets */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Singapore Property Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {PROPERTY_PRESETS.map((p) => {
            const isSelected = params.loanAmount === p.amount;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setPreset(p)}
                className={`py-1.5 px-2 text-xs rounded-lg border text-left transition-colors ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="truncate font-medium">{p.label}</div>
                <div className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {formatSGD(p.amount)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loan Amount Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            Principal Loan Amount (SGD)
          </label>
          <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
            {formatSGD(params.loanAmount)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono font-semibold text-sm">
            S$
          </span>
          <input
            type="text"
            value={params.loanAmount ? params.loanAmount.toLocaleString('en-SG') : ''}
            onChange={handleAmountChange}
            placeholder="750,000"
            className="w-full pl-10 pr-4 py-2 text-base font-mono font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent tabular-nums"
          />
        </div>
        {/* Quick adjustment buttons */}
        <div className="flex items-center gap-1.5 mt-2">
          <button
            type="button"
            onClick={() => adjustAmount(-100000)}
            className="px-2 py-1 text-[11px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
          >
            -S$100k
          </button>
          <button
            type="button"
            onClick={() => adjustAmount(-50000)}
            className="px-2 py-1 text-[11px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
          >
            -S$50k
          </button>
          <button
            type="button"
            onClick={() => adjustAmount(50000)}
            className="px-2 py-1 text-[11px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
          >
            +S$50k
          </button>
          <button
            type="button"
            onClick={() => adjustAmount(100000)}
            className="px-2 py-1 text-[11px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
          >
            +S$100k
          </button>
        </div>
      </div>

      {/* Loan Tenure */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            Loan Tenure
          </label>
          <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
            {params.tenureYears} Years ({params.tenureYears * 12} Months)
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="35"
          step="1"
          value={params.tenureYears}
          onChange={(e) => update({ tenureYears: parseInt(e.target.value, 10) })}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />
        <div className="flex items-center justify-between gap-1 mt-2">
          {[15, 20, 25, 30].map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => update({ tenureYears: yr })}
              className={`flex-1 py-1 text-[11px] font-mono rounded border transition-colors ${
                params.tenureYears === yr
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {yr} Years
            </button>
          ))}
        </div>
      </div>

      {/* SORA Rate Selection */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-800">
            MAS SORA Benchmark Reference
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            MAS Pub: {latestRecord.date}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* 3M Compounded SORA (Standard in Singapore) */}
          <button
            type="button"
            onClick={() => update({ rateType: '3m_compounded' })}
            className={`p-3 rounded-lg border text-left transition-colors relative ${
              params.rateType === '3m_compounded'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">3-Month Compounded SORA</span>
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                params.rateType === '3m_compounded' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                Most Common
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-mono font-bold tabular-nums">
                {latestRecord.sora_compound_3m.toFixed(4)}%
              </span>
              <span className={`text-[11px] ${params.rateType === '3m_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
                p.a.
              </span>
            </div>
            <p className={`text-[11px] mt-1 ${params.rateType === '3m_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
              DBS, OCBC & UOB primary mortgage benchmark
            </p>
          </button>

          {/* 1M Compounded SORA */}
          <button
            type="button"
            onClick={() => update({ rateType: '1m_compounded' })}
            className={`p-3 rounded-lg border text-left transition-colors ${
              params.rateType === '1m_compounded'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">1-Month Compounded SORA</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-mono font-bold tabular-nums">
                {latestRecord.sora_compound_1m.toFixed(4)}%
              </span>
              <span className={`text-[11px] ${params.rateType === '1m_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
                p.a.
              </span>
            </div>
            <p className={`text-[11px] mt-1 ${params.rateType === '1m_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
              Adjusts every month based on recent 30-day SORA
            </p>
          </button>

          {/* 6M Compounded SORA */}
          <button
            type="button"
            onClick={() => update({ rateType: '6m_compounded' })}
            className={`p-3 rounded-lg border text-left transition-colors ${
              params.rateType === '6m_compounded'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">6-Month Compounded SORA</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-mono font-bold tabular-nums">
                {latestRecord.sora_compound_6m.toFixed(4)}%
              </span>
              <span className={`text-[11px] ${params.rateType === '6m_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
                p.a.
              </span>
            </div>
            <p className={`text-[11px] mt-1 ${params.rateType === '6m_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
              Smoothed over half-year historical window
            </p>
          </button>

          {/* Daily SORA */}
          <button
            type="button"
            onClick={() => update({ rateType: 'daily_compounded' })}
            className={`p-3 rounded-lg border text-left transition-colors ${
              params.rateType === 'daily_compounded'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Daily Overnight SORA</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-mono font-bold tabular-nums">
                {latestRecord.sora.toFixed(4)}%
              </span>
              <span className={`text-[11px] ${params.rateType === 'daily_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
                p.a.
              </span>
            </div>
            <p className={`text-[11px] mt-1 ${params.rateType === 'daily_compounded' ? 'text-slate-300' : 'text-slate-500'}`}>
              Latest published MAS overnight unsecured rate
            </p>
          </button>
        </div>

        {/* Manual Rate Override */}
        <div className="mt-2.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={params.rateType === 'manual'}
              onChange={(e) => update({ rateType: e.target.checked ? 'manual' : '3m_compounded' })}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="font-medium">Override with Custom Base Rate</span>
          </label>

          {params.rateType === 'manual' && (
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={params.manualRate}
                  onChange={(e) => update({ manualRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-semibold text-slate-900"
                  placeholder="3.15"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-500">%</span>
              </div>
              <span className="text-xs text-slate-500">Custom SORA baseline</span>
            </div>
          )}
        </div>
      </div>

      {/* Bank Spread / Margin */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Bank Margin / Spread (+% p.a.)
            </label>
            <p className="text-[11px] text-slate-500">
              Commercial bank mark-up above SORA benchmark
            </p>
          </div>
          <button
            type="button"
            onClick={() => update({ isTiered: !params.isTiered })}
            className="text-[11px] font-medium text-slate-700 hover:text-slate-900 underline"
          >
            {params.isTiered ? 'Switch to Flat Spread' : 'Use Tiered Packages (Y1-2, Y3+)'}
          </button>
        </div>

        {!params.isTiered ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="5"
                  value={params.bankSpread}
                  onChange={(e) => update({ bankSpread: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-semibold text-slate-900 tabular-nums"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">%</span>
              </div>
              <div className="flex gap-1">
                {[0.60, 0.70, 0.85, 1.00].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ bankSpread: s })}
                    className={`px-2 py-1.5 text-xs font-mono rounded border transition-colors ${
                      params.bankSpread === s
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{s.toFixed(2)}%
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Typical Singapore bank packages range between +0.65% to +0.85% p.a.
            </p>
          </div>
        ) : (
          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700">
              Tiered Bank Spread Schedule:
            </div>
            {params.tieredSpreads.map((tier, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs gap-3">
                <span className="text-slate-600 font-medium">
                  {tier.fromYear === tier.toYear 
                    ? `Year ${tier.fromYear}` 
                    : tier.toYear >= 99 
                      ? `Year ${tier.fromYear} onwards` 
                      : `Years ${tier.fromYear} – ${tier.toYear}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono">+</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="5"
                    value={tier.spread}
                    onChange={(e) => handleTierChange(idx, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-slate-300 rounded font-mono font-semibold text-slate-800 bg-white text-right tabular-nums"
                  />
                  <span className="font-mono text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Convention & MAS Stress Testing */}
      <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Day Count Convention
          </label>
          <div className="flex rounded-lg p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => update({ dayCountConvention: 'ACT/365' })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                params.dayCountConvention === 'ACT/365'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ACT/365 (MAS Std)
            </button>
            <button
              type="button"
              onClick={() => update({ dayCountConvention: '30/360' })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                params.dayCountConvention === '30/360'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30/360
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Singapore debt & mortgage markets use ACT/365
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            MAS Stress Test Rate
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="3.0"
              max="10.0"
              value={params.stressTestRate}
              onChange={(e) => update({ stressTestRate: parseFloat(e.target.value) || 4.0 })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 tabular-nums"
            />
            <span className="absolute right-3 top-1.5 text-xs font-mono text-slate-500">%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            MAS Notice 645 requires 4.00% floor for TDSR
          </p>
        </div>
      </div>
    </div>
  );
};
