import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import EarningsSummary from '../../components/EarningsSummary';
import EarningsChart from '../../components/EarningsChart';
import { useAuth } from '../../contexts/AuthContext';
import { earningsAPI } from '../../services/api';

interface EarningEntry { 
  date: string;
  amount: number;
  status?: string;
}

interface ChartData {
  name: string;
  earnings: number;
}

const Earnings: React.FC = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState<{
    totalEarnings: number;
    pendingPayout: number;
    lastPayoutDate?: Date;
  } | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<EarningEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const [summary, history, chart, payouts] = await Promise.all([
        earningsAPI.getSummary(token),
        earningsAPI.getHistory(token),
        earningsAPI.getChartData(token),
        earningsAPI.getPayoutHistory(token)
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
    if (user?.id && user.role === 'homemaker') {
      fetchEarningsData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handlePayoutRequest = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      await earningsAPI.requestPayout(token, user?.bankDetails);
      await fetchEarningsData(); // Refresh data after payout request
    } catch (err) {
      console.error("Failed to request payout:", err);
      setError("Failed to request payout. Please try again.");
    }
  };

  if (!user || user.role !== 'homemaker') {
    return <div className="p-6 text-center">Access Denied. Please log in as a Homemaker.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      <main className="flex-grow p-6 bg-gray-50 ml-64">
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

            {/* Earnings Chart */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Earnings Trend</h2>
              <div className="bg-white p-4 rounded-lg shadow">
                <EarningsChart data={chartData} periodType="daily" />
              </div>
            </section>

            {/* Payout History Table */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Payout History</h2>
              <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payoutHistory.length > 0 ? payoutHistory.map((payout, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payout.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{payout.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payout.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            payout.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-gray-500">
                          No payout history found.
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

export default Earnings;