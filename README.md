# Singapore SORA Interest Rate Calculator & MAS API Serverless Gateway

> A financial computation suite and serverless gateway for Singapore Overnight Rate Average (SORA) pegged property mortgages, complying with the Monetary Authority of Singapore (MAS) Act/365 compounding conventions and Notice 645 Total Debt Servicing Ratio (TDSR) framework.

[![Node Version](https://img.shields.io/badge/node-%3E%3D20-blue.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![MAS Gateway](https://img.shields.io/badge/MAS%20API-SORA%20Daily-emerald.svg)](https://eservices.mas.gov.sg)

---

## 📌 Executive Overview

The Singapore market transitioned from SOR/SIBOR to SORA as the primary benchmark for floating-rate SGD loans. This repository provides:
1. **Interactive Mortgage Financial Engine**: Precision calculation for 1-Month, 3-Month, and 6-Month Compounded SORA loans.
2. **Regulatory TDSR / MSR Compliance**: Automatic 4.00% p.a. medium-term interest rate stress floor modeling (MAS Notice 645 & Notice 1115).
3. **Serverless MAS Integration (`/api`)**: High-performance serverless endpoints (`/api/sora.ts` and `/api/health.ts`) forwarding the mandatory `KeyId` header without storing hardcoded secrets.
4. **Export Engines**: Full export capabilities for amortization schedules and financial reports in both **Markdown (`.md`)** and **CSV (`.csv`)** formats.

---

## 🏛️ Singapore Overnight Rate Average (SORA) Compounding

Under MAS conventions, compounded SORA is computed using the **ACT/365** day count convention over a specified observation period:

$$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_b} \left( 1 + \frac{\text{SORA}_i \times n_i}{365} \right) - 1 \right] \times \frac{365}{d} \times 100$$

Where:
- $d_b$: Number of business days in the calculation period.
- $\text{SORA}_i$: Daily SORA rate on business day $i$.
- $n_i$: Number of calendar days for which rate $\text{SORA}_i$ applies (e.g., 3 days across weekends).
- $d$: Total number of calendar days in the compounding period.

### Mortgage Repayment Formula (Amortization)

$$\text{Monthly Installment } (M) = P \times \frac{r(1+r)^N}{(1+r)^N - 1}$$

Where:
- $P$ = Loan principal amount in SGD.
- $r = \frac{\text{SORA}_{\text{compounded}} + \text{Bank Spread}}{12}$ (monthly rate).
- $N = \text{Tenure (years)} \times 12$ (total installments).

---

## 🔌 Serverless MAS API Gateway (`/api`)

The project includes serverless endpoints located in the `/api` directory:

### 1. Daily SORA Rate Endpoint: `/api/sora`
- **Source**: MAS Statistical Bulletin Non-610 API
- **MAS URL**:
  `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
- **Method**: `GET`
- **Mandatory Header**: `KeyId: <MAS_KEY_ID>`
- **Environment Variable**: `MAS_KEY_ID` (or passed via client header `KeyId`)

#### Request Example (cURL)
```bash
curl -X GET "http://localhost:3000/api/sora?limit=30" \
  -H "Accept: application/json" \
  -H "KeyId: YOUR_MAS_KEY_ID"
```

#### JSON Response Schema
```json
{
  "success": true,
  "source": "Monetary Authority of Singapore (MAS)",
  "count": 30,
  "latest": {
    "date": "2026-10-02",
    "sora": 1.3724,
    "sora_compound_1m": 1.2672,
    "sora_compound_3m": 1.2332,
    "sora_compound_6m": 1.1689,
    "sora_index": 1.1248399542,
    "aggregate_volume": 2089,
    "highest_transaction": 1.4500,
    "lowest_transaction": 0.8000,
    "published_date": "2026-10-05T00:00:00"
  },
  "records": [ ... ]
}
```

### 2. Health & Diagnostic Probe: `/api/health`
- **Method**: `GET`
- **Response**: Checks runtime availability, Node version, and verifies if `MAS_KEY_ID` is present without revealing the credential.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm or bun

### 1. Installation
```bash
git clone https://github.com/ashblack24/SMU-interest-calculator.git
cd SMU-interest-calculator
npm install
```

### 2. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Provide your MAS Key ID in `.env` (optional for local dev; can also be provided in the UI):
```env
MAS_KEY_ID="your_mas_key_id_here"
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 📂 Repository Structure

```
├── .env.example                  # Environment template
├── api/                          # Serverless Gateway (Root Level)
│   ├── health.ts                 # Health probe & MAS credential check
│   └── sora.ts                   # MAS SORA daily rate ingestion & normalizer
├── index.html                    # Single page application entry point
├── metadata.json                 # Project descriptor
├── package.json                  # Dependencies & scripts
├── src/                          # Frontend Application
│   ├── App.tsx                   # Main state & calculation orchestrator
│   ├── components/
│   │   ├── AmortizationTable.tsx # Monthly schedule breakdown & pagination
│   │   ├── BackendGuideModal.tsx # Proxy implementation snippets (Express/Python/cURL)
│   │   ├── Header.tsx            # Navigation & rate ticker
│   │   ├── HeroSummary.tsx       # Summary KPIs, stress test & export buttons
│   │   ├── LoanInputForm.tsx     # Principal, tenure & spread parameters
│   │   ├── MasConfigModal.tsx    # MAS API credentials test dialog
│   │   ├── RateTrendChart.tsx    # SVG interactive historical trend chart
│   │   └── TdsrCalculator.tsx    # MAS Notice 645 TDSR ratio evaluator
│   ├── services/
│   │   └── masApi.ts             # Client-side gateway dispatcher & fallback benchmark
│   ├── types/
│   │   └── sora.ts               # Strict TypeScript financial interfaces
│   └── utils/
│   │   └── soraMath.ts           # Financial amortizer & day-count math
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite config & API middleware connector
```

---

## 🛡️ Security & Zero Hardcoding Guarantee

- **No Hardcoded Keys**: All API secrets are loaded dynamically via `process.env.MAS_KEY_ID` or custom headers.
- **Client Fallback**: If network or MAS endpoints are offline, the calculator gracefully defaults to official benchmark rates to prevent UI disruption.

---

## 📄 License

MIT License. Designed for Singapore financial calculations and educational mortgage modeling.
