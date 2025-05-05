import React from 'react';
import { OrderStatus } from '../interfaces/Order';
import { ordersAPI } from '../services/api'; // Correct import

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
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      // Use the correct API object and method
      const token = localStorage.getItem('authToken'); // Assuming token is stored
      if (!token) throw new Error('Authentication token not found.');
      await ordersAPI.updateOrderStatus(orderId, newStatus, token);
      onUpdateStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      // You might want to show an error toast/notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const isValidTransition = (newStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'Pending Confirmation',
      'Confirmed',
      'Preparing',
      'Ready for Pickup',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Declined'
    ];
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);
    
    // Allow cancellation from any state except delivered or already cancelled/declined
    if (newStatus === 'Cancelled') { // Use correct string literal from OrderStatus type
      return currentStatus !== 'Delivered' && currentStatus !== 'Cancelled' && currentStatus !== 'Declined';
    }

    // Allow decline only from Pending Confirmation
    if (newStatus === 'Declined') {
        return currentStatus === 'Pending Confirmation';
    }
    
    // Prevent going backwards in status (except for special cases like cancellation/decline)
    return newIndex > currentIndex;
  };

  return (
    <div className="status-updater">
      <select
        value={currentStatus}
        onChange={(e) => handleStatusUpdate(e.target.value as OrderStatus)}
        disabled={disabled || isUpdating}
        className="status-select"
      >
        {availableStatuses.map((status) => (
          <option
            key={status}
            value={status}
            disabled={!isValidTransition(status)}
          >
            {status.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusUpdater;