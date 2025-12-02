/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const handleSync = async () => {
    if (!tenantId) {
      setSyncStatus('❌ No tenant ID found. Please reconnect your store.');
      return;
    }
    
    setSyncing(true);
    setSyncStatus('🔄 Syncing data from Shopify...');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSyncStatus('✅ Sync completed successfully! Refresh to see data.');
      } else {
        setSyncStatus(`❌ Sync failed: ${data.error}`);
      }
    } catch (error: any) {
      setSyncStatus(`❌ Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold text-lg flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Successfully connected to Shopify!
              </p>
              {tenantId ? (
                <p className="text-gray-600 mt-2 text-sm">
                  Tenant ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{tenantId}</code>
                </p>
              ) : (
                <p className="text-yellow-600 mt-2 text-sm">
                  ⚠️ No tenant ID in URL. Connection may not be saved.
                </p>
              )}
            </div>
            
            <button
              onClick={handleSync}
              disabled={syncing || !tenantId}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {syncing ? '⏳ Syncing...' : '🔄 Sync Data'}
            </button>
          </div>

          {syncStatus && (
            <div className={`mt-4 p-4 rounded-lg border ${
              syncStatus.includes('✅') ? 'bg-green-50 border-green-200' :
              syncStatus.includes('❌') ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <p className="text-sm font-medium">{syncStatus}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Customers</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
            <p className="text-xs text-gray-500 mt-1">Click &quot;Sync Data&quot; to view</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
            <p className="text-xs text-gray-500 mt-1">Click &quot;Sync Data&quot; to view</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">$-</p>
            <p className="text-xs text-gray-500 mt-1">Click &quot;Sync Data&quot; to view</p>
          </div>
        </div>
      </div>
    </div>
  );
}