import React from 'react';
import { OrderStatus } from '../interfaces/Order';

interface StatusUpdaterProps {
  currentStatus: OrderStatus;
  availableStatuses: OrderStatus[];
  orderId: string;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  disabled?: boolean;
}

const StatusUpdater: React.FC<StatusUpdaterProps> = ({
  currentStatus,
  availableStatuses,
  orderId,
  onUpdateStatus,
  disabled = false
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as OrderStatus;
    onUpdateStatus(orderId, newStatus);
  };

  return (
    <div className="inline-block">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={disabled}
        className={`text-sm rounded border px-2 py-1 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
        }`}
      >
        <option value={currentStatus} disabled>{currentStatus} (Current)</option>
        {availableStatuses.map(status => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusUpdater;