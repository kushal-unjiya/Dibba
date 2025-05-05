import React from 'react';
import { DeliveryOrder } from '../interfaces/DeliveryOrder';
import { OrderStatus } from '../interfaces/Order';

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  showActions?: boolean;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ 
  order, 
  onUpdateStatus,
  showActions = true 
}) => {
  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionButton = () => {
    if (!onUpdateStatus || !showActions) return null;

    switch (order.status) {
      case 'Ready for Pickup':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'Out for Delivery')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
          >
            Pick Up Order
          </button>
        );
      case 'Out for Delivery':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'Delivered')}
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
          >
            Mark as Delivered
          </button>
        );
      default:
        return null;
    }
  };

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'Ready for Pickup':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Safely access nested properties
  const pickupStreet = order.pickupAddress?.street || 'N/A';
  const pickupCity = order.pickupAddress?.city || 'N/A';
  const pickupPostalCode = order.pickupAddress?.postalCode || 'N/A';

  const deliveryStreet = order.deliveryAddress?.street || 'N/A';
  const deliveryCity = order.deliveryAddress?.city || 'N/A';
  const deliveryPostalCode = order.deliveryAddress?.postalCode || 'N/A';

  const customerName = order.customerContact?.name || 'N/A';
  const customerPhone = order.customerContact?.phone || 'N/A';
  const customerAltPhone = order.customerContact?.alternatePhone;

  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id?.substring(0, 8) || 'N/A'}</h3>
          <p className="text-sm text-gray-500">{formatDateTime(order.orderDate)}</p>
        </div>
        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Pickup Details */}
        <div className="space-y-1">
          <h4 className="font-medium text-gray-700">Pickup From:</h4>
          <p className="text-sm">{pickupStreet}</p> {/* Use safe variable */}
          <p className="text-sm text-gray-600">
            {pickupCity}, {pickupPostalCode} {/* Use safe variables */}
          </p>
          {order.pickupOTP && (
            <p className="text-sm font-medium text-blue-600">OTP: {order.pickupOTP}</p>
          )}
        </div>

        {/* Delivery Details */}
        <div className="space-y-1">
          <h4 className="font-medium text-gray-700">Deliver To:</h4>
          <p className="text-sm">{customerName}</p> {/* Use safe variable */}
          <p className="text-sm">{customerPhone}</p> {/* Use safe variable */}
          {customerAltPhone && (
            <p className="text-sm">Alt: {customerAltPhone}</p>
          )}
          <p className="text-sm">{deliveryStreet}</p> {/* Use safe variable */}
          <p className="text-sm text-gray-600">
            {deliveryCity}, {deliveryPostalCode} {/* Use safe variables */}
          </p>
          {order.deliveryOTP && (
            <p className="text-sm font-medium text-blue-600">OTP: {order.deliveryOTP}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">
              <span className="font-medium">Items:</span> {totalItems} {/* Use safe variable */}
            </p>
            <p className="text-sm">
              <span className="font-medium">Payment:</span> {order.paymentMethod} 
              ({order.paymentStatus === 'Pending' ? 
                <span className="text-yellow-600">Collection Needed</span> : 
                <span className="text-green-600">Paid</span>
              })
            </p>
            {order.deliveryNotes && (
              <p className="text-sm mt-2">
                <span className="font-medium">Note:</span> {order.deliveryNotes}
              </p>
            )}
          </div>
          {getActionButton()}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderCard;