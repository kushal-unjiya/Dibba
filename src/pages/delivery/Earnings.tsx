import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar'; // Adjust path
import EarningsSummary from '../../components/EarningsSummary'; // Adjust path
import EarningsChart from '../../components/EarningsChart'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path

// Mock Data/API Calls (Similar structure to Homemaker Earnings)
interface DeliveryEarningEntry { date: string; deliveries: number; amount: number; }
interface DeliveryChartData { name: string; earnings: number; }

const fetchMockDeliveryEarningsData = (deliveryPartnerId: string) => {
    console.log("Fetching earnings data for delivery partner:", deliveryPartnerId);
    return new Promise<{ summary: { totalEarnings: number; pendingPayout: number; lastPayoutDate?: Date }, history: DeliveryEarningEntry[], chartData: DeliveryChartData[] }>((resolve) => {
        setTimeout(() => {
            resolve({
                summary: { totalEarnings: 1850.25, pendingPayout: 350.00, lastPayoutDate: new Date(Date.now() - 5 * 86400000) },
                history: [
                    { date: '2025-05-02', deliveries: 4, amount: 120.00 },
                    { date: '2025-05-01', deliveries: 3, amount: 95.50 },
                    { date: '2025-04-30', deliveries: 5, amount: 150.75 },
                    // ... more entries
                ],
                chartData: [ // Example daily data for a week
                    { name: 'Mon', earnings: 110 },
                    { name: 'Tue', earnings: 130 },
                    { name: 'Wed', earnings: 90 },
                    { name: 'Thu', earnings: 150 },
                    { name: 'Fri', earnings: 140 },
                    { name: 'Sat', earnings: 180 },
                    { name: 'Sun', earnings: 160 },
                ]
            });
        }, 600);
    });
};

const DeliveryEarnings: React.FC = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState<{ totalEarnings: number; pendingPayout: number; lastPayoutDate?: Date } | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<DeliveryEarningEntry[]>([]);
  const [chartData, setChartData] = useState<DeliveryChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user.role === 'delivery') {
      setIsLoading(true);
      fetchMockDeliveryEarningsData(user.id)
        .then(data => {
          setSummaryData(data.summary);
          setEarningsHistory(data.history);
          setChartData(data.chartData);
        })
        .catch(err => console.error("Failed to load earnings data", err))
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [user]);

   if (!user || user.role !== 'delivery') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Delivery Partner.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="delivery" />
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Earnings</h1>

        {isLoading ? (
          <p>Loading earnings data...</p>
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
              <EarningsChart data={chartData} />
            </section>

            {/* Earnings History Table */}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.deliveries}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{entry.amount.toFixed(2)}</td>
                      </tr>
                    )) : (
                         <tr><td colSpan={3} className="text-center py-4 text-gray-500">No earnings history found.</td></tr>
                    )}
                  </tbody>
                </table>
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