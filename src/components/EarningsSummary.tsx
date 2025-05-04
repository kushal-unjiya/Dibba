import React from 'react';

interface EarningsSummaryProps {
  totalEarnings: number;
  pendingPayout: number;
  lastPayoutDate?: Date;
  periodLabel?: string;
  showDetails?: boolean;
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({
  totalEarnings,
  pendingPayout,
  lastPayoutDate,
  periodLabel = 'All Time',
  showDetails = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Earnings ({periodLabel})</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">₹{totalEarnings.toFixed(2)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Pending Payout</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">₹{pendingPayout.toFixed(2)}</p>
        </div>

        {showDetails && lastPayoutDate && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Payout</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {new Date(lastPayoutDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Next payout scheduled for {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Payout History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsSummary;