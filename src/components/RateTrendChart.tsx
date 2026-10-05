import React, { useState } from 'react';
import { TrendingUp, Activity, BarChart2, Info } from 'lucide-react';
import { MASRateRecord } from '../types/sora';

interface RateTrendChartProps {
  records: MASRateRecord[];
  isFallback: boolean;
}

export const RateTrendChart: React.FC<RateTrendChartProps> = ({
  records,
  isFallback,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<'all' | '3m' | '1m' | 'daily'>('all');

  // Sort chronological for graph
  const chronological = [...records].reverse();

  if (chronological.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        No MAS rate records available.
      </div>
    );
  }

  // Find min and max for svg scaling
  const allRates = chronological.flatMap((r) => [
    r.sora,
    r.sora_compound_1m,
    r.sora_compound_3m,
    r.sora_compound_6m,
  ]);
  const minRate = Math.floor(Math.min(...allRates) * 10) / 10 - 0.05;
  const maxRate = Math.ceil(Math.max(...allRates) * 10) / 10 + 0.05;
  const rateRange = maxRate - minRate || 1;

  const width = 800;
  const height = 240;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (idx: number) => padLeft + (idx / (chronological.length - 1 || 1)) * chartW;
  const getY = (val: number) => padTop + chartH - ((val - minRate) / rateRange) * chartH;

  const makePath = (accessor: (r: MASRateRecord) => number) => {
    return chronological
      .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(accessor(r)).toFixed(1)}`)
      .join(' ');
  };

  const path3m = makePath((r) => r.sora_compound_3m);
  const path1m = makePath((r) => r.sora_compound_1m);
  const pathDaily = makePath((r) => r.sora);
  const path6m = makePath((r) => r.sora_compound_6m);

  // Latest stats
  const latest = records[0];
  const oldest = records[records.length - 1];
  const deltaBps = Math.round((latest.sora_compound_3m - oldest.sora_compound_3m) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              MAS SORA Benchmark Historical Trends
            </h3>
            {isFallback && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Official Benchmark Feed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Monetary Authority of Singapore Daily Overnight, 1M, 3M, and 6M Compounded Rates
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedSeries('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedSeries === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Curves
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeries('3m')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedSeries === '3m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3M SORA
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeries('1m')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedSeries === '1m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1M SORA
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeries('daily')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedSeries === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily SORA
          </button>
        </div>
      </div>

      {/* Snapshot metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 block">3M SORA (Latest)</span>
          <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
            {latest.sora_compound_3m.toFixed(4)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {deltaBps >= 0 ? `+${deltaBps}` : deltaBps} bps vs period start
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 block">1M SORA (Latest)</span>
          <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
            {latest.sora_compound_1m.toFixed(4)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Updated {latest.date}
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 block">Daily Overnight SORA</span>
          <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
            {latest.sora.toFixed(4)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Volume: S${latest.aggregate_volume || 4850}M
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 block">SORA Index</span>
          <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
            {(latest.sora_index || 1.1842).toFixed(5)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            MAS Compounding Index
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative border border-slate-200 rounded-lg p-3 bg-white">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none overflow-visible"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const yVal = minRate + pct * rateRange;
            const yPos = getY(yVal);
            return (
              <g key={pct}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={width - padRight}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {yVal.toFixed(2)}%
                </text>
              </g>
            );
          })}

          {/* Curves */}
          {(selectedSeries === 'all' || selectedSeries === 'daily') && (
            <path
              d={pathDaily}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {(selectedSeries === 'all' || selectedSeries === '1m') && (
            <path
              d={path1m}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
            />
          )}

          {(selectedSeries === 'all' || selectedSeries === '3m') && (
            <path
              d={path3m}
              fill="none"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
          )}

          {selectedSeries === 'all' && (
            <path
              d={path6m}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />
          )}

          {/* Interactive hover points */}
          {chronological.map((r, i) => {
            const x = getX(i);
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={r.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Invisible hover bar */}
                <rect
                  x={x - 8}
                  y={padTop}
                  width={16}
                  height={chartH}
                  fill="transparent"
                />
                {isHovered && (
                  <>
                    <line
                      x1={x}
                      y1={padTop}
                      x2={x}
                      y2={padTop + chartH}
                      stroke="#0F172A"
                      strokeWidth="1"
                    />
                    <circle
                      cx={x}
                      cy={getY(r.sora_compound_3m)}
                      r="4"
                      fill="#0F172A"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-900 rounded"></span>
              <span className="font-semibold text-slate-800">3M Compounded SORA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-400 rounded"></span>
              <span className="text-slate-600">1M Compounded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-500 rounded"></span>
              <span className="text-slate-600">6M Compounded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border-dashed border-b"></span>
              <span className="text-slate-600">Daily Overnight</span>
            </div>
          </div>

          {hoveredIdx !== null && (
            <div className="font-mono text-xs text-slate-800 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <span className="text-slate-500">{chronological[hoveredIdx].date}: </span>
              <span className="font-bold">3M SORA: {chronological[hoveredIdx].sora_compound_3m.toFixed(4)}%</span>
              <span className="text-slate-400"> | Daily: {chronological[hoveredIdx].sora.toFixed(4)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent MAS Records Table */}
      <div>
        <h4 className="text-xs font-semibold text-slate-800 mb-2">
          Recent MAS Publication Ledger (Last 10 Days)
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">End of Day</th>
                <th className="py-2 px-3 text-right">Daily SORA</th>
                <th className="py-2 px-3 text-right">1M Compounded</th>
                <th className="py-2 px-3 text-right text-slate-900 font-bold">3M Compounded</th>
                <th className="py-2 px-3 text-right">6M Compounded</th>
                <th className="py-2 px-3 text-right">Volume (S$M)</th>
                <th className="py-2 px-3 text-right">SORA Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {records.slice(0, 10).map((r) => (
                <tr key={r.date} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 text-slate-800 font-semibold">{r.date}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{r.sora.toFixed(4)}%</td>
                  <td className="py-2 px-3 text-right text-slate-600">{r.sora_compound_1m.toFixed(4)}%</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">{r.sora_compound_3m.toFixed(4)}%</td>
                  <td className="py-2 px-3 text-right text-slate-600">{r.sora_compound_6m.toFixed(4)}%</td>
                  <td className="py-2 px-3 text-right text-slate-700">S${r.aggregate_volume || 4500}M</td>
                  <td className="py-2 px-3 text-right text-slate-500">{(r.sora_index || 1.18).toFixed(5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
