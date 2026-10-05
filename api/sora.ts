const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export interface ProcessedSoraRecord {
  date: string;
  sora: number;
  sora_compound_1m: number;
  sora_compound_3m: number;
  sora_compound_6m: number;
  sora_index?: number;
  aggregate_volume?: number;
  highest_transaction?: number;
  lowest_transaction?: number;
  published_date?: string;
}

export interface SoraApiResponse {
  success: boolean;
  source: string;
  count: number;
  latest?: ProcessedSoraRecord;
  records: ProcessedSoraRecord[];
  error?: string;
  statusCode?: number;
}

/**
 * Fetch and process SORA rates from the official Monetary Authority of Singapore API Gateway.
 * Strictly uses process.env.MAS_KEY_ID or incoming request KeyId header (NO hardcoded keys).
 */
export async function fetchSoraFromMas(
  keyId?: string,
  topLimit: number = 30
): Promise<{ data?: SoraApiResponse; error?: string; status: number }> {
  // Read KeyId from parameter, environment, or process (no hardcoded keys)
  const apiKey = (
    keyId ||
    process.env.MAS_KEY_ID ||
    process.env.KEY_ID ||
    ''
  ).trim();

  if (!apiKey) {
    return {
      status: 401,
      error:
        'Missing MAS KeyId. Please configure MAS_KEY_ID in environment variables or pass header "KeyId: <YOUR_KEY>"',
    };
  }

  try {
    // Construct MAS API URL with orderby descending and top limit
    const masUrl = new URL(MAS_SORA_ENDPOINT);
    masUrl.searchParams.set('$orderby', 'end_of_day desc');
    // Fetch extra rows to ensure enough valid business days after filtering weekends/preliminaries
    const fetchCount = Math.max(10, Math.min(100, topLimit * 2));
    masUrl.searchParams.set('$top', fetchCount.toString());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const masResponse = await fetch(masUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'KeyId': apiKey, // Mandatory MAS header
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!masResponse.ok) {
      const errText = await masResponse.text().catch(() => '');
      return {
        status: masResponse.status,
        error: `MAS Gateway responded with status ${masResponse.status}: ${errText.slice(0, 300)}`,
      };
    }

    const payload: any = await masResponse.json();
    const elements: any[] = Array.isArray(payload?.elements)
      ? payload.elements
      : Array.isArray(payload?.result?.records)
      ? payload.result.records
      : [];

    if (elements.length === 0) {
      return {
        status: 200,
        data: {
          success: true,
          source: 'Monetary Authority of Singapore (MAS)',
          count: 0,
          records: [],
        },
      };
    }

    // Filter and normalize records (exclude preliminary empty days where sora is null)
    const validRecords: ProcessedSoraRecord[] = [];

    for (const item of elements) {
      // Must have date and at least one valid rate metric
      const date = item.end_of_day || item.date;
      if (!date) continue;

      const rawSora = item.sora ?? item.rate;
      const raw3m = item.comp_sora_3m ?? item.sora_compound_3m;
      const raw1m = item.comp_sora_1m ?? item.sora_compound_1m;
      const raw6m = item.comp_sora_6m ?? item.sora_compound_6m;

      // Skip non-business dates or empty records without SORA data
      if (rawSora == null && raw3m == null) continue;

      const soraVal = parseFloat(rawSora) || 0;
      const sora1m = parseFloat(raw1m) || soraVal;
      const sora3m = parseFloat(raw3m) || soraVal;
      const sora6m = parseFloat(raw6m) || soraVal;

      validRecords.push({
        date,
        sora: soraVal,
        sora_compound_1m: sora1m,
        sora_compound_3m: sora3m,
        sora_compound_6m: sora6m,
        sora_index: item.sora_index ? parseFloat(item.sora_index) : undefined,
        aggregate_volume: item.aggregate_volume ? parseFloat(item.aggregate_volume) : undefined,
        highest_transaction: item.highest_transaction ? parseFloat(item.highest_transaction) : undefined,
        lowest_transaction: item.lowest_transaction ? parseFloat(item.lowest_transaction) : undefined,
        published_date: item.published_date || undefined,
      });

      if (validRecords.length >= topLimit) break;
    }

    return {
      status: 200,
      data: {
        success: true,
        source: 'Monetary Authority of Singapore (MAS)',
        count: validRecords.length,
        latest: validRecords[0],
        records: validRecords,
      },
    };
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    return {
      status: 504,
      error: isTimeout
        ? 'MAS API Gateway request timed out after 9 seconds'
        : `MAS API Gateway connection error: ${err?.message || 'Unknown network error'}`,
    };
  }
}

/**
 * Node.js serverless handler (Vercel, Express, AWS Lambda, Cloud Run)
 */
export default async function handler(req: any, res: any) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-api-key');
    res.statusCode = 204;
    res.end();
    return;
  }

  // Extract KeyId from request header if present
  const headerKey =
    req.headers?.['keyid'] ||
    req.headers?.['KeyId'] ||
    req.headers?.['x-api-key'];

  // Parse query parameter limit
  const queryLimit = req.query?.limit || req.query?.top;
  const limit = parseInt(queryLimit as string, 10) || 30;

  const result = await fetchSoraFromMas(
    typeof headerKey === 'string' ? headerKey : undefined,
    limit
  );

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = result.status;

  if (result.error) {
    res.end(
      JSON.stringify({
        success: false,
        error: result.error,
        statusCode: result.status,
      })
    );
    return;
  }

  res.end(JSON.stringify(result.data, null, 2));
}

/**
 * Web Fetch standard handler (Edge functions, Cloudflare Workers, Next.js Route Handlers)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit') || url.searchParams.get('top');
  const limit = parseInt(limitParam || '30', 10) || 30;

  const headerKey =
    request.headers.get('KeyId') ||
    request.headers.get('keyid') ||
    request.headers.get('x-api-key') ||
    undefined;

  const result = await fetchSoraFromMas(headerKey, limit);

  return new Response(
    JSON.stringify(result.data || { success: false, error: result.error }),
    {
      status: result.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
