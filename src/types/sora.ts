export type SoraRateType = '1m_compounded' | '3m_compounded' | '6m_compounded' | 'daily_compounded' | 'manual';

export interface MASRateRecord {
  date: string; // YYYY-MM-DD
  sora: number; // Daily SORA rate (% p.a.)
  sora_compound_1m: number; // 1-Month Compounded SORA (% p.a.)
  sora_compound_3m: number; // 3-Month Compounded SORA (% p.a.)
  sora_compound_6m: number; // 6-Month Compounded SORA (% p.a.)
  sora_index?: number;
  aggregate_volume?: number; // S$ millions
  highest_transaction?: number;
  lowest_transaction?: number;
}

export interface MASApiConfig {
  apiKey: string; // KeyId header
  endpointUrl: string;
  useFallbackData: boolean;
  lastFetchedAt: string | null;
  status: 'idle' | 'testing' | 'connected' | 'fallback' | 'error';
  errorMessage?: string;
  responsePreview?: string;
}

export interface TieredSpread {
  fromYear: number;
  toYear: number;
  spread: number; // in % (e.g., 0.70)
}

export interface LoanParameters {
  loanAmount: number; // S$
  tenureYears: number; // 5 - 35 years
  rateType: SoraRateType;
  bankSpread: number; // e.g. 0.75%
  isTiered: boolean;
  tieredSpreads: TieredSpread[];
  manualRate: number; // if manual
  stressTestRate: number; // default 4.0% (MAS regulation)
  dayCountConvention: 'ACT/365' | '30/360';
  startDate: string; // YYYY-MM-DD
}

export interface BorrowerProfile {
  grossMonthlyIncome: number; // S$
  otherMonthlyDebts: number; // car loans, personal loans, credit card min
  propertyType: 'HDB' | 'EC' | 'PRIVATE';
  isFirstProperty: boolean;
}

export interface MonthlyAmortizationItem {
  period: number;
  date: string;
  yearNumber: number;
  monthInYear: number;
  baseRate: number;
  spread: number;
  effectiveRate: number;
  monthlyInstallment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface YearlyAmortizationItem {
  year: number;
  calendarYear: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  averageRate: number;
}

export interface CalculationResult {
  monthlyInstallment: number;
  effectiveRate: number;
  baseRate: number;
  spread: number;
  totalInterestPaid: number;
  totalPayment: number;
  stressTestInstallment: number;
  stressTestRate: number;
  monthlySchedule: MonthlyAmortizationItem[];
  yearlySchedule: YearlyAmortizationItem[];
  // Affordability
  tdsrRatio: number; // Total Debt Servicing Ratio (max 55%)
  msrRatio: number | null; // Mortgage Servicing Ratio (max 30% for HDB/EC)
  isTdsrPass: boolean;
  isMsrPass: boolean | null;
  maxAffordableLoan: number;
}
