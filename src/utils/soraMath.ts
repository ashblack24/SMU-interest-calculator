import {
  LoanParameters,
  BorrowerProfile,
  CalculationResult,
  MonthlyAmortizationItem,
  YearlyAmortizationItem,
  MASRateRecord,
  SoraRateType,
} from '../types/sora';

/**
 * Calculates MAS Compounded SORA from an array of daily overnight rates
 * Formula prescribed by MAS:
 * Compounded SORA = [ Product(1 + (r_i * n_i / 365)) - 1 ] * (365 / d) * 100%
 */
export function calculateCompoundedSoraFromDaily(
  dailyRates: { rate: number; days: number }[],
  totalDays: number
): number {
  if (!dailyRates.length || totalDays <= 0) return 0;

  let compoundFactor = 1.0;
  for (const item of dailyRates) {
    // r_i is in percentage, convert to decimal: r_i / 100
    const dailyDecimal = (item.rate / 100) * (item.days / 365);
    compoundFactor *= 1.0 + dailyDecimal;
  }

  const annualizedRate = (compoundFactor - 1.0) * (365 / totalDays) * 100;
  // Standard MAS convention rounds compounded SORA to 4 decimal places
  return Math.round(annualizedRate * 10000) / 10000;
}

/**
 * Extracts base SORA rate depending on user selection
 */
export function getBaseSoraRate(
  rateType: SoraRateType,
  latestRecord: MASRateRecord,
  manualRate: number
): number {
  switch (rateType) {
    case '1m_compounded':
      return latestRecord.sora_compound_1m;
    case '3m_compounded':
      return latestRecord.sora_compound_3m;
    case '6m_compounded':
      return latestRecord.sora_compound_6m;
    case 'daily_compounded':
      return latestRecord.sora;
    case 'manual':
      return manualRate;
    default:
      return latestRecord.sora_compound_3m;
  }
}

/**
 * Gets bank spread for a given loan year (supports tiered spreads e.g. Year 1-2 lower, Year 3+ higher)
 */
export function getBankSpreadForYear(params: LoanParameters, yearNumber: number): number {
  if (!params.isTiered || !params.tieredSpreads || params.tieredSpreads.length === 0) {
    return params.bankSpread;
  }

  for (const tier of params.tieredSpreads) {
    if (yearNumber >= tier.fromYear && yearNumber <= tier.toYear) {
      return tier.spread;
    }
  }

  // Fallback to highest year's spread or default
  const lastTier = params.tieredSpreads[params.tieredSpreads.length - 1];
  return lastTier ? lastTier.spread : params.bankSpread;
}

/**
 * Standard monthly mortgage installment formula:
 * M = P * [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
 * where r is monthly interest rate, n is total months
 */
export function calculateMonthlyInstallment(
  principal: number,
  annualRatePct: number,
  totalMonths: number
): number {
  if (principal <= 0 || totalMonths <= 0) return 0;
  if (annualRatePct <= 0) return principal / totalMonths;

  const monthlyRate = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const payment = (principal * (monthlyRate * factor)) / (factor - 1);
  return Math.round(payment * 100) / 100;
}

/**
 * Calculates complete SORA mortgage breakdown, amortization schedule,
 * stress test, and TDSR/MSR affordability
 */
export function calculateSoraLoan(
  params: LoanParameters,
  latestRecord: MASRateRecord,
  borrower: BorrowerProfile
): CalculationResult {
  const baseRate = getBaseSoraRate(params.rateType, latestRecord, params.manualRate);
  const totalMonths = Math.max(1, params.tenureYears * 12);
  const initialSpread = getBankSpreadForYear(params, 1);
  const initialEffectiveRate = Math.round((baseRate + initialSpread) * 10000) / 10000;

  // Monthly schedule generation
  const monthlySchedule: MonthlyAmortizationItem[] = [];
  const yearlyMap = new Map<number, {
    principalPaid: number;
    interestPaid: number;
    totalPaid: number;
    endingBalance: number;
    rates: number[];
  }>();

  let currentBalance = params.loanAmount;
  const start = params.startDate ? new Date(params.startDate) : new Date();

  // Initial installment based on initial effective rate
  const initialMonthlyInstallment = calculateMonthlyInstallment(
    params.loanAmount,
    initialEffectiveRate,
    totalMonths
  );

  let totalInterestPaid = 0;
  let totalPayment = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const yearNumber = Math.ceil(month / 12);
    const monthInYear = ((month - 1) % 12) + 1;

    // Determine spread for this year
    const currentSpread = getBankSpreadForYear(params, yearNumber);
    const currentEffectiveRate = Math.round((baseRate + currentSpread) * 10000) / 10000;

    // Remaining months in loan
    const remainingMonths = totalMonths - month + 1;

    // Recompute installment if rate changed (tiered) or use current
    const currentInstallment = calculateMonthlyInstallment(
      currentBalance,
      currentEffectiveRate,
      remainingMonths
    );

    // Days in current month for ACT/365 calculation
    const currentDate = new Date(start.getFullYear(), start.getMonth() + month - 1, 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    let monthlyInterest = 0;
    if (params.dayCountConvention === 'ACT/365') {
      // Singapore standard ACT/365 convention
      monthlyInterest = (currentBalance * (currentEffectiveRate / 100) * daysInMonth) / 365;
    } else {
      // 30/360 convention
      monthlyInterest = (currentBalance * (currentEffectiveRate / 100)) / 12;
    }

    monthlyInterest = Math.round(monthlyInterest * 100) / 100;
    let principalPaid = currentInstallment - monthlyInterest;

    // Handling final month balance settling
    if (month === totalMonths || principalPaid > currentBalance) {
      principalPaid = currentBalance;
    }

    const actualMonthlyPayment = principalPaid + monthlyInterest;
    currentBalance = Math.max(0, currentBalance - principalPaid);

    totalInterestPaid += monthlyInterest;
    totalPayment += actualMonthlyPayment;

    const dateStr = currentDate.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
    });

    monthlySchedule.push({
      period: month,
      date: dateStr,
      yearNumber,
      monthInYear,
      baseRate,
      spread: currentSpread,
      effectiveRate: currentEffectiveRate,
      monthlyInstallment: Math.round(actualMonthlyPayment * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      interestPaid: Math.round(monthlyInterest * 100) / 100,
      remainingBalance: Math.round(currentBalance * 100) / 100,
    });

    // Aggregate to yearly map
    if (!yearlyMap.has(yearNumber)) {
      yearlyMap.set(yearNumber, {
        principalPaid: 0,
        interestPaid: 0,
        totalPaid: 0,
        endingBalance: 0,
        rates: [],
      });
    }

    const yr = yearlyMap.get(yearNumber)!;
    yr.principalPaid += principalPaid;
    yr.interestPaid += monthlyInterest;
    yr.totalPaid += actualMonthlyPayment;
    yr.endingBalance = currentBalance;
    yr.rates.push(currentEffectiveRate);
  }

  // Build yearly list
  const yearlySchedule: YearlyAmortizationItem[] = [];
  const startYear = start.getFullYear();

  yearlyMap.forEach((val, yrNum) => {
    const avgRate = val.rates.reduce((a, b) => a + b, 0) / (val.rates.length || 1);
    yearlySchedule.push({
      year: yrNum,
      calendarYear: startYear + yrNum - 1,
      principalPaid: Math.round(val.principalPaid * 100) / 100,
      interestPaid: Math.round(val.interestPaid * 100) / 100,
      totalPaid: Math.round(val.totalPaid * 100) / 100,
      endingBalance: Math.round(val.endingBalance * 100) / 100,
      averageRate: Math.round(avgRate * 100) / 100,
    });
  });

  // MAS Regulatory Stress Test Calculation (MAS Notice 645 requires 4.0% floor for residential loans)
  const stressTestRate = Math.max(params.stressTestRate || 4.0, initialEffectiveRate);
  const stressTestInstallment = calculateMonthlyInstallment(
    params.loanAmount,
    stressTestRate,
    totalMonths
  );

  // Affordability metrics: TDSR and MSR
  const income = Math.max(1, borrower.grossMonthlyIncome);
  const otherDebts = borrower.otherMonthlyDebts || 0;

  // Total Debt Servicing Ratio uses the MAS stress-tested installment + other debts
  const totalDebtObligations = stressTestInstallment + otherDebts;
  const tdsrRatio = Math.round((totalDebtObligations / income) * 1000) / 10;
  const isTdsrPass = tdsrRatio <= 55.0; // MAS limit: 55%

  // Mortgage Servicing Ratio applies to HDB flats and Executive Condominiums (MSR cap 30%)
  let msrRatio: number | null = null;
  let isMsrPass: boolean | null = null;

  if (borrower.propertyType === 'HDB' || borrower.propertyType === 'EC') {
    msrRatio = Math.round((initialMonthlyInstallment / income) * 1000) / 10;
    isMsrPass = msrRatio <= 30.0; // MAS MSR limit: 30%
  }

  // Max affordable loan calculation (governed by lower of TDSR or MSR limits)
  const maxMonthlyPaymentTdsr = Math.max(0, income * 0.55 - otherDebts);
  const maxMonthlyPaymentMsr = (borrower.propertyType === 'HDB' || borrower.propertyType === 'EC')
    ? income * 0.30
    : Infinity;

  const allowablePayment = Math.min(maxMonthlyPaymentTdsr, maxMonthlyPaymentMsr);
  const monthlyStressRate = (stressTestRate / 100) / 12;
  const factor = Math.pow(1 + monthlyStressRate, totalMonths);
  const maxAffordableLoan = allowablePayment > 0 && factor > 1
    ? Math.round((allowablePayment * (factor - 1)) / (monthlyStressRate * factor))
    : 0;

  return {
    monthlyInstallment: initialMonthlyInstallment,
    effectiveRate: initialEffectiveRate,
    baseRate: Math.round(baseRate * 10000) / 10000,
    spread: initialSpread,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    stressTestInstallment: Math.round(stressTestInstallment * 100) / 100,
    stressTestRate,
    monthlySchedule,
    yearlySchedule,
    tdsrRatio,
    msrRatio,
    isTdsrPass,
    isMsrPass,
    maxAffordableLoan,
  };
}

export function formatSGD(amount: number, includeDecimals = false): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

export function formatPct(rate: number, decimals = 2): string {
  return `${rate.toFixed(decimals)}%`;
}
