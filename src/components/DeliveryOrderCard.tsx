import React from 'react';
import { DeliveryOrder } from '../interfaces/DeliveryOrder';
import { OrderStatus } from '../interfaces/Order';

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ order, onUpdateStatus }) => {
  // Helper function to get appropriate action button based on status
  const getActionButton = () => {
    if (!onUpdateStatus) return null;

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

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id.substring(0, 6)}...</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.orderDate).toLocaleString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-sm font-medium ${
          order.status === 'Ready for Pickup' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Pickup Details */}
        <div className="space-y-1">
          <h4 className="font-medium text-gray-700">Pickup From:</h4>
          <p className="text-sm">{order.pickupAddress.street}</p>
          <p className="text-sm text-gray-600">
            {order.pickupAddress.city}, {order.pickupAddress.postalCode}
          </p>
        </div>

        {/* Delivery Details */}
        <div className="space-y-1">
          <h4 className="font-medium text-gray-700">Deliver To:</h4>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm">{order.customerPhone}</p>
          <p className="text-sm">{order.deliveryAddress.street}</p>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
          </p>
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">
              <span className="font-medium">Items:</span> {order.items.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Payment:</span> {order.paymentMethod} 
              ({order.paymentStatus === 'Pending' ? 
                <span className="text-yellow-600">Collection Needed</span> : 
                <span className="text-green-600">Paid</span>
              })
            </p>
          </div>
          {getActionButton()}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderCard;