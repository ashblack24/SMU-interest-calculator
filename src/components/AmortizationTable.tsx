import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { MonthlyAmortizationItem, YearlyAmortizationItem } from '../types/sora';
import { formatSGD } from '../utils/soraMath';

interface AmortizationTableProps {
  monthlySchedule: MonthlyAmortizationItem[];
  yearlySchedule: YearlyAmortizationItem[];
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  monthlySchedule,
  yearlySchedule,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 24; // 2 years at a time for monthly

  // Filtered monthly rows
  const filteredMonthly = useMemo(() => {
    if (!searchQuery.trim()) return monthlySchedule;
    const q = searchQuery.toLowerCase();
    return monthlySchedule.filter(
      (m) =>
        m.date.toLowerCase().includes(q) ||
        `year ${m.yearNumber}`.includes(q) ||
        `month ${m.period}`.includes(q)
    );
  }, [monthlySchedule, searchQuery]);

  // Paginated monthly rows
  const totalPages = Math.ceil(filteredMonthly.length / rowsPerPage);
  const paginatedMonthly = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMonthly.slice(start, start + rowsPerPage);
  }, [filteredMonthly, currentPage, rowsPerPage]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Amortization Schedule & Principal Reduction
          </h3>
          <p className="text-xs text-slate-500">
            Computed on ACT/365 monthly compounding based on current SORA package
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex rounded-lg p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setViewMode('yearly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Summary ({yearlySchedule.length} Yrs)
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly ({monthlySchedule.length} Months)
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar for Monthly View */}
      {viewMode === 'monthly' && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search year, month, date..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span>Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        {viewMode === 'yearly' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Year</th>
                <th className="py-2.5 px-4 font-semibold">Calendar</th>
                <th className="py-2.5 px-4 font-semibold text-right">Avg Rate</th>
                <th className="py-2.5 px-4 font-semibold text-right">Annual Repayment</th>
                <th className="py-2.5 px-4 font-semibold text-right text-slate-900">Principal Paid</th>
                <th className="py-2.5 px-4 font-semibold text-right text-amber-700">Interest Paid</th>
                <th className="py-2.5 px-4 font-semibold text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    Year {row.year}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-sans">
                    {row.calendarYear}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-700">
                    {row.averageRate.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                    {formatSGD(row.totalPaid)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-800">
                    {formatSGD(row.principalPaid)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-amber-700">
                    {formatSGD(row.interestPaid)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                    {formatSGD(row.endingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">#</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold text-right">Rate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Installment</th>
                <th className="py-2.5 px-3 font-semibold text-right text-slate-900">Principal</th>
                <th className="py-2.5 px-3 font-semibold text-right text-amber-700">Interest</th>
                <th className="py-2.5 px-3 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {paginatedMonthly.map((m) => (
                <tr key={m.period} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 text-slate-400 text-[11px]">
                    {m.period}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-sans text-xs">
                    {m.date}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 text-[11px]">
                    {m.effectiveRate.toFixed(2)}%
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-900">
                    {formatSGD(m.monthlyInstallment, true)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {formatSGD(m.principalPaid, true)}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-700">
                    {formatSGD(m.interestPaid, true)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-900">
                    {formatSGD(m.remainingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Singapore MAS ACT/365 Amortization Calculation</span>
        <span>All amounts in Singapore Dollars (SGD)</span>
      </div>
    </div>
  );
};
