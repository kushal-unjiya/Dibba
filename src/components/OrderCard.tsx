import React from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../interfaces/Order';

interface OrderCardProps {
  order: Order;
  userRole: 'customer' | 'homemaker';
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onViewDetails?: (orderId: string) => void;
}

// Helper to get status color
const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'Pending Confirmation': return 'bg-gray-100 text-gray-800';
    case 'Confirmed': return 'bg-blue-100 text-blue-800';
    case 'Preparing': return 'bg-indigo-100 text-indigo-800';
    case 'Ready for Pickup': return 'bg-yellow-100 text-yellow-800';
    case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
    case 'Delivered': return 'bg-green-100 text-green-800';
    case 'Cancelled':
    case 'Declined': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, userRole, onUpdateStatus, onViewDetails }) => {
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0; // Add safe check for items array

  const handleAccept = () => {
    if (onUpdateStatus) onUpdateStatus(order.id, 'Confirmed');
  };

  const handleDecline = () => {
    if (onUpdateStatus) onUpdateStatus(order.id, 'Declined');
  };

  const handleReady = () => {
    if (onUpdateStatus) onUpdateStatus(order.id, 'Ready for Pickup');
  };

  // Safely format total amount, defaulting to 0.00 if null or undefined
  const formattedTotalAmount = (typeof order.totalAmount === 'number')
    ? order.totalAmount.toFixed(2)
    : '0.00';

  return (
    <div className="border rounded-lg p-4 mb-4 shadow bg-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id?.substring(0, 8) || 'N/A'}...</h3>
          <p className="text-sm text-gray-500">Placed on: {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</p>
          {userRole === 'homemaker' && <p className="text-sm text-gray-600">Customer ID: {order.customerId?.substring(0, 6) || 'N/A'}...</p>}
          {userRole === 'customer' && <p className="text-sm text-gray-600">Homemaker ID: {order.homemakerId?.substring(0, 6) || 'N/A'}...</p>}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status || 'Unknown'}
        </span>
      </div>
      <div className="text-sm text-gray-700 mb-3">
        <p><strong>Items:</strong> {totalItems}</p>
        <p><strong>Total:</strong> ₹{formattedTotalAmount}</p> {/* Use the safe formatted value */}
        <p><strong>Address:</strong> {order.deliveryAddress?.street || 'N/A'}, {order.deliveryAddress?.city || 'N/A'}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        {onViewDetails && (
          <button onClick={() => onViewDetails(order.id)} className="text-blue-600 hover:underline text-sm">
            View Details
          </button>
        )}

        {/* Homemaker Actions */}
        {userRole === 'homemaker' && order.status === 'Pending Confirmation' && onUpdateStatus && (
          <>
            <button onClick={handleAccept} className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm">
              Accept
            </button>
            <button onClick={handleDecline} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm">
              Decline
            </button>
          </>
        )}
        {userRole === 'homemaker' && order.status === 'Confirmed' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(order.id, 'Preparing')} className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-3 rounded text-sm">
            Mark as Preparing
          </button>
        )}
        {userRole === 'homemaker' && order.status === 'Preparing' && onUpdateStatus && (
          <button onClick={handleReady} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm">
            Mark Ready for Pickup
          </button>
        )}

        {/* Customer Actions */}
        {userRole === 'customer' && (order.status === 'Pending Confirmation' || order.status === 'Confirmed') && (
          <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm">
            Cancel Order
          </button>
        )}
        {userRole === 'customer' && !['Delivered', 'Cancelled', 'Declined'].includes(order.status) && (
          <Link to={`/customer/tracking/${order.id}`} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm">
            Track Order
          </Link>
        )}
      </div>
    </div>
  );
};

export default OrderCard;