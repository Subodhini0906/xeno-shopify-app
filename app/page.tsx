'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [shop, setShop] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  const handleConnect = () => {
    if (!shop) {
      alert('Please enter your shop domain');
      return;
    }

    setLoading(true);
    const shopDomain = shop.includes('.myshopify.com') 
      ? shop 
      : `${shop}.myshopify.com`;
    
    window.location.href = `/api/auth/shopify?shop=${shopDomain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Xeno Data Sync
          </h1>
          <p className="text-gray-600">
            Connect your Shopify store to get started
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Domain
            </label>
            <input
              type="text"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="your-store.myshopify.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Shopify store URL
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Connecting...' : 'Connect Store'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
         Dont have a store?{' '}
          
            <a href="https://partners.shopify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Create one
          </a>
        </div>
      </div>
    </div>
  );
}