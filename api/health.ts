import type { IncomingMessage, ServerResponse } from 'http';

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  service: string;
  environment: {
    nodeVersion: string;
    hasMasKeyId: boolean;
  };
  masEndpoint: string;
}

/**
 * Health check handler for MAS SORA Serverless API
 * Supports both standard Node.js serverless (req, res) and Web standard Request/Response
 */
export async function getHealthStatus(reqHeaders?: Record<string, string | string[] | undefined>): Promise<HealthResponse> {
  const envKey = process.env.MAS_KEY_ID || process.env.KEY_ID;
  const headerKey = reqHeaders ? (reqHeaders['keyid'] || reqHeaders['KeyId'] || reqHeaders['x-api-key']) : undefined;
  const hasKey = Boolean((envKey && envKey.trim().length > 0) || (headerKey && typeof headerKey === 'string' && headerKey.trim().length > 0));

  return {
    status: hasKey ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'MAS SORA Serverless Gateway',
    environment: {
      nodeVersion: process.version,
      hasMasKeyId: hasKey,
    },
    masEndpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily',
  };
}

// Node.js serverless handler (Vercel, Express, AWS Lambda wrapper)
export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-api-key');
    res.statusCode = 204;
    res.end();
    return;
  }

  const healthData = await getHealthStatus(req.headers);
  const statusCode = healthData.status === 'ok' ? 200 : 200; // still 200 with degraded note

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = statusCode;
  res.end(JSON.stringify(healthData, null, 2));
}

// Web Fetch standard (Vercel Edge, Cloudflare, Next.js Route Handlers)
export async function GET(request: Request) {
  const headersObj: Record<string, string> = {};
  request.headers.forEach((val, key) => {
    headersObj[key] = val;
  });

  const healthData = await getHealthStatus(headersObj);

  return new Response(JSON.stringify(healthData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
