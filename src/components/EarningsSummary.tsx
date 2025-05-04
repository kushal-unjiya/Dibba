import React from 'react';

interface EarningsSummaryProps {
  totalEarnings: number;
  pendingPayout: number;
  lastPayoutDate?: Date | string;
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({ totalEarnings, pendingPayout, lastPayoutDate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-green-800">Total Earnings</h4>
        <p className="text-2xl font-semibold text-green-900">₹{totalEarnings.toFixed(2)}</p>
      </div>
      <div className="bg-yellow-100 p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-yellow-800">Pending Payout</h4>
        <p className="text-2xl font-semibold text-yellow-900">₹{pendingPayout.toFixed(2)}</p>
        <button className="mt-1 text-xs text-blue-600 hover:underline">Request Withdrawal</button>
      </div>
      <div className="bg-blue-100 p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-blue-800">Last Payout</h4>
        <p className="text-lg font-semibold text-blue-900">
          {lastPayoutDate ? new Date(lastPayoutDate).toLocaleDateString() : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default EarningsSummary;