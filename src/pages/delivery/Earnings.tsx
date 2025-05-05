import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import EarningsSummary from '../../components/EarningsSummary';
import EarningsChart from '../../components/EarningsChart';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryAPI } from '../../services/api';

interface DeliveryEarningEntry { 
  date: string;
  deliveries: number;
  amount: number;
}

interface DeliveryChartData {
  name: string;
  earnings: number;
}

const DeliveryEarnings: React.FC = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState<{ 
    totalEarnings: number;
    pendingPayout: number;
    lastPayoutDate?: Date;
    todayStats: {
      deliveries: number;
      earnings: number;
    };
  } | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<DeliveryEarningEntry[]>([]);
  const [chartData, setChartData] = useState<DeliveryChartData[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const [summary, history, chart, payouts] = await Promise.all([
        deliveryAPI.getEarningsSummary(token),
        deliveryAPI.getEarningsHistory(token),
        deliveryAPI.getEarningsChartData(token),
        deliveryAPI.getPayoutHistory(token)
      ]);

      setSummaryData(summary);
      setEarningsHistory(history);
      setChartData(chart);
      setPayoutHistory(payouts);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch earnings data:", err);
      setError("Failed to load earnings data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user.role === 'delivery') {
      fetchEarningsData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handlePayoutRequest = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      await deliveryAPI.requestPayout(token, user?.bankDetails);
      await fetchEarningsData(); // Refresh data after payout request
    } catch (err) {
      console.error("Failed to request payout:", err);
      setError("Failed to request payout. Please try again.");
    }
  };

  if (!user || user.role !== 'delivery') {
    return <div className="p-6 text-center">Access Denied. Please log in as a Delivery Partner.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="delivery" />
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Earnings</h1>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading earnings data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchEarningsData} 
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : summaryData ? (
          <>
            {/* Earnings Summary */}
            <EarningsSummary
              totalEarnings={summaryData.totalEarnings}
              pendingPayout={summaryData.pendingPayout}
              lastPayoutDate={summaryData.lastPayoutDate}
            />

            {/* Today's Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Today's Deliveries</h3>
                <p className="text-2xl font-bold text-gray-800">{summaryData.todayStats.deliveries}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Today's Earnings</h3>
                <p className="text-2xl font-bold text-gray-800">₹{summaryData.todayStats.earnings.toFixed(2)}</p>
              </div>
            </div>

            {/* Earnings Chart */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Earnings Trend</h2>
              <div className="bg-white p-4 rounded-lg shadow">
                <EarningsChart data={chartData} periodType="daily" />
              </div>
            </section>

            {/* Daily Summary Table */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Daily Summary</h2>
              <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earningsHistory.length > 0 ? earningsHistory.map((entry, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.deliveries}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{entry.amount.toFixed(2)}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-gray-500">
                          No earnings history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Payout Request Button */}
                {summaryData.pendingPayout >= 500 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={handlePayoutRequest}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Request Payout
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <p className="text-red-500">Failed to load earnings data.</p>
        )}
      </main>
    </div>
  );
};

export default DeliveryEarnings;