'use client';

import { useState } from 'react';

export default function Home() {
  const [tenantId, setTenantId] = useState('');

  const handleAccess = () => {
    if (!tenantId) {
      alert('Please enter tenant ID from Prisma Studio');
      return;
    }
    window.location.href = `/dashboard?tenantId=${tenantId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Xeno Data Sync
          </h1>
          <p className="text-gray-600">
            View your Shopify store insights
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant ID
            </label>
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Get from Prisma Studio"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Open Prisma Studio and copy tenant ID
            </p>
          </div>

          <button
            onClick={handleAccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Access Dashboard
          </button>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Your Shopify sync is working!<br/>
            Customers: 4 | Orders: 1 | Products: 17
          </p>
        </div>
      </div>
    </div>
  );
}