import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar'; // Adjust path
import EarningsSummary from '../../components/EarningsSummary'; // Adjust path
import EarningsChart from '../../components/EarningsChart'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path

// Mock Data/API Calls
interface EarningEntry { date: string; amount: number; } // For table/list
interface ChartData { name: string; earnings: number; } // For chart

const fetchMockEarningsData = (homemakerId: string) => {
    console.log("Fetching earnings data for homemaker:", homemakerId);
    return new Promise<{ summary: { totalEarnings: number; pendingPayout: number; lastPayoutDate?: Date }, history: EarningEntry[], chartData: ChartData[] }>((resolve) => {
        setTimeout(() => {
            resolve({
                summary: { totalEarnings: 5850.75, pendingPayout: 1250.50, lastPayoutDate: new Date(Date.now() - 7 * 86400000) },
                history: [
                    { date: '2025-05-02', amount: 230.00 },
                    { date: '2025-05-01', amount: 150.00 },
                    { date: '2025-04-30', amount: 350.50 },
                    { date: '2025-04-28', amount: 180.25 },
                    // ... more entries
                ],
                chartData: [ // Example weekly data
                    { name: 'Week 1', earnings: 1200 },
                    { name: 'Week 2', earnings: 1550 },
                    { name: 'Week 3', earnings: 1300 },
                    { name: 'Week 4', earnings: 1800.75 },
                ]
            });
        }, 600);
    });
};

const Earnings: React.FC = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState<{ totalEarnings: number; pendingPayout: number; lastPayoutDate?: Date } | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<EarningEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user.role === 'homemaker') {
      setIsLoading(true);
      fetchMockEarningsData(user.id)
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

   if (!user || user.role !== 'homemaker') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Homemaker.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      <main className="flex-grow p-6 bg-gray-50">
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
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Payout History</h2>
              <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> {/* Example */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earningsHistory.length > 0 ? earningsHistory.map((entry, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{entry.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Completed</td> {/* Example status */}
                      </tr>
                    )) : (
                        <tr><td colSpan={3} className="text-center py-4 text-gray-500">No payout history found.</td></tr>
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

export default Earnings;