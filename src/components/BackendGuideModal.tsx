import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Server, ShieldCheck } from 'lucide-react';
import { MASApiConfig } from '../types/sora';

interface BackendGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MASApiConfig;
}

export const BackendGuideModal: React.FC<BackendGuideModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [activeSnippet, setActiveSnippet] = useState<'express' | 'curl' | 'python' | 'fetch'>('express');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const keyPlaceholder = config.apiKey || '<YOUR_MAS_KEY_ID>';

  const snippets = {
    express: `// Express / Node.js Backend Proxy for MAS SORA Rates
// Handles CORS and forwards the mandatory "KeyId" header
import express from 'express';

const app = express();
const MAS_KEY_ID = process.env.MAS_KEY_ID || '${keyPlaceholder}';
const MAS_URL = 'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3083-461a-aec7-0eb6491c6372&limit=30';

app.get('/api/sora', async (req, res) => {
  try {
    const response = await fetch(MAS_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'KeyId': MAS_KEY_ID, // <-- Mandatory MAS header
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: \`MAS API returned HTTP \${response.status}\`,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,

    curl: `# cURL Command testing MAS SORA Endpoint with KeyId
curl -X GET \\
  "https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3083-461a-aec7-0eb6491c6372&limit=10" \\
  -H "Accept: application/json" \\
  -H "KeyId: ${keyPlaceholder}"`,

    python: `# Python / FastAPI or Flask Proxy
import os
import requests
from fastapi import FastAPI, HTTPException

app = FastAPI()
MAS_KEY_ID = os.getenv("MAS_KEY_ID", "${keyPlaceholder}")
MAS_URL = "https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3083-461a-aec7-0eb6491c6372&limit=30"

@app.get("/api/sora")
def get_sora_rates():
    headers = {
        "Accept": "application/json",
        "KeyId": MAS_KEY_ID,  # Mandatory MAS Header
    }
    response = requests.get(MAS_URL, headers=headers)
    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail="MAS API Error")
    return response.json()`,

    fetch: `// Standard JavaScript Fetch with KeyId header
const masKeyId = '${keyPlaceholder}';
const response = await fetch('https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3083-461a-aec7-0eb6491c6372&limit=30', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'KeyId': masKeyId, // Required header
  },
});
const data = await response.json();
console.log('MAS SORA Rates:', data);`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(snippets[activeSnippet]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Backend API Handoff &amp; Header Contract
              </h2>
              <p className="text-xs text-slate-500">
                Ready-to-use snippets for your backend integration with <span className="font-mono font-semibold">KeyId: &lt;MAS_KEY_ID&gt;</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* KeyId Contract Highlight */}
          <div className="p-3.5 bg-slate-900 text-white rounded-lg text-xs flex items-start justify-between gap-4 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-sans">
                Required MAS Request Header
              </span>
              <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                KeyId: {keyPlaceholder}
              </span>
              <p className="text-slate-400 text-[11px] font-sans mt-1">
                MAS API Gateway requires this exact header on every request to authorize rate access.
              </p>
            </div>
            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 text-[10px] shrink-0 font-sans">
              Header Specification
            </span>
          </div>

          {/* Snippet Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveSnippet('express')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSnippet === 'express' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Express / Node
              </button>
              <button
                type="button"
                onClick={() => setActiveSnippet('curl')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSnippet === 'curl' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                cURL
              </button>
              <button
                type="button"
                onClick={() => setActiveSnippet('python')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSnippet === 'python' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Python FastAPI
              </button>
              <button
                type="button"
                onClick={() => setActiveSnippet('fetch')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSnippet === 'fetch' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Fetch API
              </button>
            </div>

            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code block */}
          <div className="relative">
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              <code>{snippets[activeSnippet]}</code>
            </pre>
          </div>

          {/* Workflow Step Explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
            <h4 className="font-semibold text-slate-900">How to connect when your backend is ready:</h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-700">
              <li>
                Create an endpoint in your server (e.g. <span className="font-mono text-slate-900 font-semibold">GET /api/sora</span>) copying the snippet above.
              </li>
              <li>
                Store your real MAS Key ID in your server environment variables (<span className="font-mono text-slate-900 font-semibold">MAS_KEY_ID</span>).
              </li>
              <li>
                In this calculator, click <span className="font-semibold text-slate-900">MAS KeyId</span> in the top header and update the endpoint URL to <span className="font-mono text-slate-900 font-semibold">/api/sora</span>.
              </li>
              <li>
                The calculator will immediately stream real-time rates from your backend without browser CORS issues!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
