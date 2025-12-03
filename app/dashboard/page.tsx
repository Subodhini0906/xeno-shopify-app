'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Stats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalProducts: number;
}

interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  totalSpent: number;
  ordersCount: number;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    if (tenantId) {
      fetchDashboardData();
    }
  }, [tenantId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await fetch(`/api/dashboard/stats?tenantId=${tenantId}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch top customers
      const customersRes = await fetch(`/api/dashboard/top-customers?tenantId=${tenantId}&limit=5`);
      const customersData = await customersRes.json();
      setTopCustomers(customersData.customers || []);

      // Fetch orders by date
      const ordersRes = await fetch(`/api/dashboard/orders-by-date?tenantId=${tenantId}`);
      const ordersData = await ordersRes.json();
      setOrdersData(ordersData.data || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!tenantId) {
      setSyncStatus('❌ No tenant ID found');
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
        setSyncStatus('✅ Sync completed! Refreshing data...');
        await fetchDashboardData();
      } else {
        setSyncStatus(`❌ Sync failed: ${data.error}`);
      }
    } catch (error: any) {
      setSyncStatus(`❌ Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600">⚠️ No tenant ID provided in URL</p>
          <p className="text-gray-600 mt-2">Please access via: /dashboard?tenantId=YOUR_ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopify Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Tenant: {tenantId.substring(0, 12)}...</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {syncing ? '⏳ Syncing...' : '🔄 Sync Data'}
          </button>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className={`mb-6 p-4 rounded-lg border ${
            syncStatus.includes('✅') ? 'bg-green-50 border-green-200' :
            syncStatus.includes('❌') ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <p className="text-sm font-medium">{syncStatus}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Customers"
                value={stats?.totalCustomers || 0}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Total Orders"
                value={stats?.totalOrders || 0}
                icon="📦"
                color="green"
              />
              <StatCard
                title="Total Revenue"
                value={`$${(stats?.totalRevenue || 0).toFixed(2)}`}
                icon="💰"
                color="purple"
              />
              <StatCard
                title="Avg Order Value"
                value={`$${(stats?.averageOrderValue || 0).toFixed(2)}`}
                icon="📊"
                color="orange"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Orders Over Time */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Over Time</h2>
                {ordersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ordersData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No order data available</p>
                )}
              </div>

              {/* Revenue Over Time */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
                {ordersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ordersData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No revenue data available</p>
                )}
              </div>
            </div>

            {/* Top Customers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top 5 Customers by Spend</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topCustomers.length > 0 ? (
                      topCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.ordersCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ${customer.totalSpent.toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No customer data available. Click "Sync Data" to import from Shopify.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-3xl p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}