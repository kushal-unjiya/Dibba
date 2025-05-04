import React from 'react';
import { Order } from '../interfaces/Order';
import OrderCard from './OrderCard'; // Re-use OrderCard for display

interface OrderHistoryProps {
  orders: Order[];
  isLoading?: boolean;
  error?: string | null;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, isLoading, error }) => {
  if (isLoading) {
    return <p className="text-center py-4">Loading order history...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-4">Error loading orders: {error}</p>;
  }

  if (!orders || orders.length === 0) {
    return <p className="text-center text-gray-500 py-4">You haven't placed any orders yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">Your Order History</h3>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} userRole="customer" />
        // Add handlers for view details if needed in OrderCard props
      ))}
    </div>
  );
};

export default OrderHistory;