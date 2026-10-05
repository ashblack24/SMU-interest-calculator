import React, { useState } from 'react';
import { X, Key, Globe, Check, AlertCircle, RefreshCw, Copy, CheckCheck, ShieldAlert } from 'lucide-react';
import { MASApiConfig } from '../types/sora';
import { DEFAULT_MAS_ENDPOINT, fetchMasSoraRates } from '../services/masApi';

interface MasConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MASApiConfig;
  onSaveConfig: (newConfig: MASApiConfig) => void;
  onSyncComplete: () => void;
}

export const MasConfigModal: React.FC<MasConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncComplete,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [endpointUrl, setEndpointUrl] = useState(config.endpointUrl || DEFAULT_MAS_ENDPOINT);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusText: string;
    statusCode?: number;
    rawSnippet?: string;
    requestHeaders?: Record<string, string>;
  } | null>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const tempConfig: MASApiConfig = {
      ...config,
      apiKey: apiKey.trim(),
      endpointUrl: endpointUrl.trim(),
    };

    const result = await fetchMasSoraRates(tempConfig);
    setIsTesting(false);

    setTestResult({
      success: !result.isFallback,
      statusText: result.statusText,
      statusCode: result.statusCode,
      rawSnippet: result.rawResponse,
      requestHeaders: result.requestHeadersSent,
    });
  };

  const handleSave = () => {
    const updated: MASApiConfig = {
      ...config,
      apiKey: apiKey.trim(),
      endpointUrl: endpointUrl.trim(),
      status: testResult?.success ? 'connected' : (apiKey ? 'fallback' : 'idle'),
      lastFetchedAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
    onSyncComplete();
    onClose();
  };

  const handleResetDefaultUrl = () => {
    setEndpointUrl(DEFAULT_MAS_ENDPOINT);
  };

  const copyHeaderInstruction = () => {
    navigator.clipboard.writeText(`KeyId: ${apiKey.trim() || '<YOUR_MAS_KEY_ID>'}`);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                MAS API Gateway Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Configure Monetary Authority of Singapore KeyId credentials and endpoints
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Header requirement prompt info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Mandatory MAS Request Header</span>
              <button
                type="button"
                onClick={copyHeaderInstruction}
                className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
              >
                {copiedHeader ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHeader ? 'Copied' : 'Copy Header'}</span>
              </button>
            </div>
            <div className="bg-white px-3 py-2 border border-slate-200 rounded font-mono text-slate-800 text-[12px] flex items-center justify-between">
              <span>KeyId: {apiKey.trim() || '&lt;MAS_KEY_ID&gt;'}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-semibold">HTTP Header</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Every outbound request to the MAS Developer Portal / API Gateway must present this header.
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                MAS Key ID (<span className="font-mono text-slate-500">KeyId</span>)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. mas_live_key_9182a4c..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Obtained from the MAS API Developer Portal. Saved locally in your browser session.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Target SORA Endpoint / Proxy URL
                </label>
                <button
                  type="button"
                  onClick={handleResetDefaultUrl}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                >
                  Reset Default
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="https://eservices.mas.gov.sg/api/..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                For production backend integration, point this to your server proxy (e.g. <span className="font-mono">/api/sora</span>) to avoid browser cross-origin limits.
              </p>
            </div>
          </div>

          {/* Test connection action */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing MAS Gateway...' : 'Send Test Request with KeyId'}</span>
            </button>
          </div>

          {/* Test results diagnostic box */}
          {testResult && (
            <div className={`p-4 rounded-lg border text-xs space-y-2 ${
              testResult.success 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{testResult.statusText}</p>
                  {testResult.statusCode !== undefined && testResult.statusCode > 0 && (
                    <p className="font-mono text-[11px] opacity-80 mt-0.5">
                      HTTP Status Code: {testResult.statusCode}
                    </p>
                  )}
                </div>
              </div>

              {testResult.requestHeaders && (
                <div className="bg-white/80 p-2.5 rounded border border-slate-200/80 font-mono text-[11px] space-y-1">
                  <p className="font-semibold text-slate-700 text-[10px] uppercase font-sans">
                    Request Headers Dispatched:
                  </p>
                  {Object.entries(testResult.requestHeaders).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}:</span>
                      <span className="text-slate-800 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {testResult.rawSnippet && (
                <div className="bg-white/80 p-2.5 rounded border border-slate-200/80 font-mono text-[10px] text-slate-700 overflow-x-auto max-h-24">
                  {testResult.rawSnippet}
                </div>
              )}
            </div>
          )}

          {/* Notice about frontend vs backend */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 space-y-1">
            <p className="font-medium text-slate-800">
              Frontend Client Notice
            </p>
            <p>
              When running directly in web browsers, cross-origin requests to <span className="font-mono">eservices.mas.gov.sg</span> may be blocked by CORS unless proxied by a server. The calculator seamlessly falls back to accurate recent MAS published rates so you can test all loan math, while allowing you to verify that <span className="font-mono">KeyId: &lt;MAS_KEY_ID&gt;</span> is correctly prepared for your backend.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Save Credentials & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
