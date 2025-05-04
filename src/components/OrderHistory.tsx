import React from 'react';
import { Order } from '../interfaces/Order';
import OrderCard from './OrderCard';

interface OrderHistoryProps {
  orders: Order[];
  userRole: 'customer' | 'homemaker';
  onUpdateStatus?: (orderId: string, status: Order['status']) => void;
  onViewDetails?: (orderId: string) => void;
  loading?: boolean;
  error?: string | null;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  userRole,
  onUpdateStatus,
  onViewDetails,
  loading = false,
  error = null
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No orders found.</p>
        {userRole === 'customer' && (
          <p className="text-sm text-gray-500 mt-2">
            Browse our menu to place your first order!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          userRole={userRole}
          onUpdateStatus={onUpdateStatus}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default OrderHistory;