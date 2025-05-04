import React from 'react';
import { OrderStatus } from '../interfaces/Order';

interface StatusUpdaterProps {
  currentStatus: OrderStatus;
  availableStatuses: OrderStatus[]; // List of statuses the user can transition to
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

  // Don't render if no statuses can be selected
  if (!availableStatuses || availableStatuses.length === 0) {
    return null;
  }

  // Simple dropdown implementation
  return (
    <div className="inline-flex items-center space-x-2">
       <span className="text-sm font-medium">Update Status:</span>
       <select
         value={currentStatus} // Show current status, but allow selecting next ones
         onChange={(e) => onUpdateStatus(orderId, e.target.value as OrderStatus)}
         disabled={disabled}
         className="p-1 border rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
       >
         {/* Include current status as the default selected, but maybe disabled */}
         <option value={currentStatus} disabled>{currentStatus} (Current)</option>
         {availableStatuses.map(status => (
           <option key={status} value={status}>
             {status}
           </option>
         ))}
       </select>
       {/* Or use buttons for specific actions */}
       {/* {availableStatuses.map(status => (
            <button
                key={status}
                onClick={() => onUpdateStatus(orderId, status)}
                disabled={disabled}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
            >
                Mark as {status}
            </button>
       ))} */}
    </div>
  );
};

export default StatusUpdater;