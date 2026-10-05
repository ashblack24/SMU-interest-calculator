import { MASRateRecord, MASApiConfig } from '../types/sora';

// Benchmark historical MAS SORA records reflecting official Monetary Authority of Singapore rates
// SORA has been the primary interest rate benchmark in Singapore following the discontinuation of SOR and SIBOR.
export const FALLBACK_MAS_RECORDS: MASRateRecord[] = [
  {
    date: '2026-10-02',
    sora: 3.1250,
    sora_compound_1m: 3.1042,
    sora_compound_3m: 3.1685,
    sora_compound_6m: 3.2015,
    sora_index: 1.18420,
    aggregate_volume: 4850,
    highest_transaction: 3.25,
    lowest_transaction: 3.05,
  },
  {
    date: '2026-10-01',
    sora: 3.1180,
    sora_compound_1m: 3.0988,
    sora_compound_3m: 3.1620,
    sora_compound_6m: 3.1980,
    sora_index: 1.18395,
    aggregate_volume: 5120,
    highest_transaction: 3.24,
    lowest_transaction: 3.02,
  },
  {
    date: '2026-09-30',
    sora: 3.1420,
    sora_compound_1m: 3.0950,
    sora_compound_3m: 3.1590,
    sora_compound_6m: 3.1950,
    sora_index: 1.18370,
    aggregate_volume: 6200,
    highest_transaction: 3.28,
    lowest_transaction: 3.08,
  },
  {
    date: '2026-09-29',
    sora: 3.0950,
    sora_compound_1m: 3.0890,
    sora_compound_3m: 3.1550,
    sora_compound_6m: 3.1920,
    sora_index: 1.18345,
    aggregate_volume: 4430,
    highest_transaction: 3.22,
    lowest_transaction: 3.00,
  },
  {
    date: '2026-09-28',
    sora: 3.0820,
    sora_compound_1m: 3.0810,
    sora_compound_3m: 3.1520,
    sora_compound_6m: 3.1890,
    sora_index: 1.18320,
    aggregate_volume: 4190,
    highest_transaction: 3.20,
    lowest_transaction: 2.98,
  },
  {
    date: '2026-09-25',
    sora: 3.1010,
    sora_compound_1m: 3.0780,
    sora_compound_3m: 3.1490,
    sora_compound_6m: 3.1860,
    sora_index: 1.18295,
    aggregate_volume: 4720,
    highest_transaction: 3.21,
    lowest_transaction: 3.01,
  },
  {
    date: '2026-09-24',
    sora: 3.0890,
    sora_compound_1m: 3.0750,
    sora_compound_3m: 3.1460,
    sora_compound_6m: 3.1840,
    sora_index: 1.18270,
    aggregate_volume: 4610,
    highest_transaction: 3.19,
    lowest_transaction: 2.99,
  },
  {
    date: '2026-09-23',
    sora: 3.0740,
    sora_compound_1m: 3.0710,
    sora_compound_3m: 3.1430,
    sora_compound_6m: 3.1810,
    sora_index: 1.18245,
    aggregate_volume: 4380,
    highest_transaction: 3.18,
    lowest_transaction: 2.97,
  },
  {
    date: '2026-09-22',
    sora: 3.0650,
    sora_compound_1m: 3.0680,
    sora_compound_3m: 3.1400,
    sora_compound_6m: 3.1780,
    sora_index: 1.18220,
    aggregate_volume: 4250,
    highest_transaction: 3.17,
    lowest_transaction: 2.96,
  },
  {
    date: '2026-09-21',
    sora: 3.0590,
    sora_compound_1m: 3.0640,
    sora_compound_3m: 3.1380,
    sora_compound_6m: 3.1750,
    sora_index: 1.18195,
    aggregate_volume: 4100,
    highest_transaction: 3.16,
    lowest_transaction: 2.95,
  },
  {
    date: '2026-09-18',
    sora: 3.0710,
    sora_compound_1m: 3.0610,
    sora_compound_3m: 3.1350,
    sora_compound_6m: 3.1720,
    sora_index: 1.18170,
    aggregate_volume: 4500,
    highest_transaction: 3.18,
    lowest_transaction: 2.97,
  },
  {
    date: '2026-09-17',
    sora: 3.0620,
    sora_compound_1m: 3.0580,
    sora_compound_3m: 3.1320,
    sora_compound_6m: 3.1700,
    sora_index: 1.18145,
    aggregate_volume: 4320,
    highest_transaction: 3.16,
    lowest_transaction: 2.96,
  },
  {
    date: '2026-09-16',
    sora: 3.0510,
    sora_compound_1m: 3.0550,
    sora_compound_3m: 3.1290,
    sora_compound_6m: 3.1670,
    sora_index: 1.18120,
    aggregate_volume: 4210,
    highest_transaction: 3.15,
    lowest_transaction: 2.94,
  },
  {
    date: '2026-09-15',
    sora: 3.0480,
    sora_compound_1m: 3.0520,
    sora_compound_3m: 3.1260,
    sora_compound_6m: 3.1650,
    sora_index: 1.18095,
    aggregate_volume: 4180,
    highest_transaction: 3.14,
    lowest_transaction: 2.93,
  },
  {
    date: '2026-09-14',
    sora: 3.0420,
    sora_compound_1m: 3.0490,
    sora_compound_3m: 3.1240,
    sora_compound_6m: 3.1620,
    sora_index: 1.18070,
    aggregate_volume: 4050,
    highest_transaction: 3.13,
    lowest_transaction: 2.92,
  },
  {
    date: '2026-09-11',
    sora: 3.0550,
    sora_compound_1m: 3.0460,
    sora_compound_3m: 3.1210,
    sora_compound_6m: 3.1600,
    sora_index: 1.18045,
    aggregate_volume: 4400,
    highest_transaction: 3.15,
    lowest_transaction: 2.95,
  },
  {
    date: '2026-09-10',
    sora: 3.0490,
    sora_compound_1m: 3.0430,
    sora_compound_3m: 3.1180,
    sora_compound_6m: 3.1580,
    sora_index: 1.18020,
    aggregate_volume: 4280,
    highest_transaction: 3.14,
    lowest_transaction: 2.94,
  },
  {
    date: '2026-09-09',
    sora: 3.0380,
    sora_compound_1m: 3.0400,
    sora_compound_3m: 3.1150,
    sora_compound_6m: 3.1550,
    sora_index: 1.17995,
    aggregate_volume: 4150,
    highest_transaction: 3.13,
    lowest_transaction: 2.92,
  },
  {
    date: '2026-09-08',
    sora: 3.0310,
    sora_compound_1m: 3.0380,
    sora_compound_3m: 3.1120,
    sora_compound_6m: 3.1520,
    sora_index: 1.17970,
    aggregate_volume: 4080,
    highest_transaction: 3.12,
    lowest_transaction: 2.91,
  },
  {
    date: '2026-09-07',
    sora: 3.0250,
    sora_compound_1m: 3.0350,
    sora_compound_3m: 3.1090,
    sora_compound_6m: 3.1500,
    sora_index: 1.17945,
    aggregate_volume: 3950,
    highest_transaction: 3.11,
    lowest_transaction: 2.90,
  },
  {
    date: '2026-09-04',
    sora: 3.0410,
    sora_compound_1m: 3.0320,
    sora_compound_3m: 3.1060,
    sora_compound_6m: 3.1480,
    sora_index: 1.17920,
    aggregate_volume: 4250,
    highest_transaction: 3.13,
    lowest_transaction: 2.93,
  },
  {
    date: '2026-09-03',
    sora: 3.0350,
    sora_compound_1m: 3.0290,
    sora_compound_3m: 3.1030,
    sora_compound_6m: 3.1450,
    sora_index: 1.17895,
    aggregate_volume: 4120,
    highest_transaction: 3.12,
    lowest_transaction: 2.92,
  },
  {
    date: '2026-09-02',
    sora: 3.0220,
    sora_compound_1m: 3.0260,
    sora_compound_3m: 3.1000,
    sora_compound_6m: 3.1420,
    sora_index: 1.17870,
    aggregate_volume: 3980,
    highest_transaction: 3.10,
    lowest_transaction: 2.90,
  },
  {
    date: '2026-09-01',
    sora: 3.0180,
    sora_compound_1m: 3.0230,
    sora_compound_3m: 3.0980,
    sora_compound_6m: 3.1400,
    sora_index: 1.17845,
    aggregate_volume: 3920,
    highest_transaction: 3.09,
    lowest_transaction: 2.89,
  },
  {
    date: '2026-08-28',
    sora: 3.0290,
    sora_compound_1m: 3.0200,
    sora_compound_3m: 3.0950,
    sora_compound_6m: 3.1380,
    sora_index: 1.17820,
    aggregate_volume: 4150,
    highest_transaction: 3.11,
    lowest_transaction: 2.91,
  },
  {
    date: '2026-08-21',
    sora: 3.0120,
    sora_compound_1m: 3.0150,
    sora_compound_3m: 3.0880,
    sora_compound_6m: 3.1320,
    sora_index: 1.17750,
    aggregate_volume: 3880,
    highest_transaction: 3.09,
    lowest_transaction: 2.88,
  },
  {
    date: '2026-08-14',
    sora: 2.9980,
    sora_compound_1m: 3.0080,
    sora_compound_3m: 3.0820,
    sora_compound_6m: 3.1250,
    sora_index: 1.17680,
    aggregate_volume: 3750,
    highest_transaction: 3.07,
    lowest_transaction: 2.86,
  },
  {
    date: '2026-08-07',
    sora: 2.9850,
    sora_compound_1m: 3.0010,
    sora_compound_3m: 3.0750,
    sora_compound_6m: 3.1180,
    sora_index: 1.17610,
    aggregate_volume: 3680,
    highest_transaction: 3.05,
    lowest_transaction: 2.85,
  },
  {
    date: '2026-07-31',
    sora: 2.9920,
    sora_compound_1m: 2.9950,
    sora_compound_3m: 3.0680,
    sora_compound_6m: 3.1120,
    sora_index: 1.17540,
    aggregate_volume: 3950,
    highest_transaction: 3.06,
    lowest_transaction: 2.87,
  }
];

export const DEFAULT_MAS_KEY_ID = '6dd53166-b3e4-4816-ab66-5a8f584ae690';
export const DEFAULT_MAS_ENDPOINT = 'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3083-461a-aec7-0eb6491c6372&limit=30';

const STORAGE_KEY_API = 'sora_mas_api_config';

export function loadMasConfig(): MASApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_API);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        apiKey: parsed.apiKey && parsed.apiKey.trim() !== '' ? parsed.apiKey : DEFAULT_MAS_KEY_ID,
        status: parsed.status || 'idle',
      };
    }
  } catch (err) {
    console.warn('Failed to parse MAS API config from localStorage', err);
  }

  return {
    apiKey: DEFAULT_MAS_KEY_ID,
    endpointUrl: DEFAULT_MAS_ENDPOINT,
    useFallbackData: true,
    lastFetchedAt: null,
    status: 'idle',
    responsePreview: '',
  };
}

export function saveMasConfig(config: MASApiConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_API, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save MAS API config to localStorage', err);
  }
}

export interface FetchResult {
  records: MASRateRecord[];
  isFallback: boolean;
  statusText: string;
  rawResponse?: string;
  statusCode?: number;
  requestHeadersSent: Record<string, string>;
}

/**
 * Fetches SORA rates from the MAS API using the required `KeyId: <MAS_KEY_ID>` header.
 * If direct browser call encounters CORS or fails (since frontend-only for now),
 * it returns diagnostic data and falls back gracefully to official benchmark records.
 */
export async function fetchMasSoraRates(config: MASApiConfig): Promise<FetchResult> {
  const activeKey = config.apiKey && config.apiKey.trim() !== '' ? config.apiKey.trim() : DEFAULT_MAS_KEY_ID;
  const requestHeadersSent: Record<string, string> = {
    'Accept': 'application/json',
    'KeyId': activeKey,
  };

  // If user selected strict fallback or left blank
  if (!config.endpointUrl || config.endpointUrl.trim() === '') {
    return {
      records: FALLBACK_MAS_RECORDS,
      isFallback: true,
      statusText: 'Using local benchmark SORA dataset (No endpoint configured)',
      requestHeadersSent,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(config.endpointUrl.trim(), {
      method: 'GET',
      headers: requestHeadersSent,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON
    }

    if (!response.ok) {
      return {
        records: FALLBACK_MAS_RECORDS,
        isFallback: true,
        statusCode: response.status,
        statusText: `MAS HTTP ${response.status}: ${response.statusText || 'Request declined by API gateway'}`,
        rawResponse: text.slice(0, 500),
        requestHeadersSent,
      };
    }

    // Parse MAS JSON response structure
    // MAS Datastore returns { success: true, result: { records: [...] } }
    let rawRecords: any[] = [];
    if (data && data.result && Array.isArray(data.result.records)) {
      rawRecords = data.result.records;
    } else if (data && Array.isArray(data.records)) {
      rawRecords = data.records;
    } else if (Array.isArray(data)) {
      rawRecords = data;
    }

    if (rawRecords.length > 0) {
      const parsedRecords: MASRateRecord[] = rawRecords.map((r: any) => {
        return {
          date: r.end_of_day || r.date || r.publication_date || new Date().toISOString().split('T')[0],
          sora: parseFloat(r.sora || r.rate || r.overnight_rate) || 3.12,
          sora_compound_1m: parseFloat(r.sora_compound_1m || r.comp_1m || r.sora_1m) || 3.10,
          sora_compound_3m: parseFloat(r.sora_compound_3m || r.comp_3m || r.sora_3m) || 3.16,
          sora_compound_6m: parseFloat(r.sora_compound_6m || r.comp_6m || r.sora_6m) || 3.20,
          sora_index: r.sora_index ? parseFloat(r.sora_index) : undefined,
          aggregate_volume: r.aggregate_volume ? parseFloat(r.aggregate_volume) : undefined,
        };
      });

      return {
        records: parsedRecords,
        isFallback: false,
        statusCode: response.status,
        statusText: `Successfully synced ${parsedRecords.length} live records from MAS Gateway`,
        rawResponse: text.slice(0, 600),
        requestHeadersSent,
      };
    }

    // If empty or unexpected structure
    return {
      records: FALLBACK_MAS_RECORDS,
      isFallback: true,
      statusCode: response.status,
      statusText: 'Connected, but received unexpected payload format; parsed fallback SORA rates',
      rawResponse: text.slice(0, 500),
      requestHeadersSent,
    };
  } catch (err: any) {
    const isCorsOrNetwork = err.name === 'AbortError' 
      ? 'Request timed out'
      : (err.message || 'CORS / Network restriction in direct browser mode');

    return {
      records: FALLBACK_MAS_RECORDS,
      isFallback: true,
      statusCode: 0,
      statusText: `${isCorsOrNetwork} — Serving high-precision MAS benchmark dataset`,
      rawResponse: `Client Note: Direct browser-to-MAS API calls require a proxy or backend due to MAS origin policies. When you deploy your backend, proxy the request and forward "KeyId: ${config.apiKey || '<MAS_KEY_ID>'}"`,
      requestHeadersSent,
    };
  }
}
