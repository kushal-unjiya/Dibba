import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import OrderCard from '../../components/OrderCard';
import { Order, OrderStatus } from '../../interfaces/Order';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';

const OrderManager: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const fetchedOrders = await ordersAPI.getHomemakerOrders(user.id, token);
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user.role === 'homemaker') {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    const originalOrders = [...orders];
    try {
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      await ordersAPI.updateOrderStatus(orderId, newStatus, token);

      if (['Ready for Pickup'].includes(newStatus)) {
        console.log('Order is now available for delivery partners');
      }

      // Refetch orders if status filter is active and order no longer matches
      if (statusFilter !== 'all' && newStatus !== statusFilter) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error);
      alert("Failed to update order status. Please try again.");
      // Revert optimistic update on failure
      setOrders(originalOrders);
    }
  };

  const handleFilterChange = (newFilter: OrderStatus | 'all') => {
    setStatusFilter(newFilter);
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (!user || user.role !== 'homemaker') {
    return <div className="p-6 text-center text-red-600">Access Denied. Please log in as a Homemaker.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      <main className="flex-grow p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Order Manager</h1>
            <select 
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value as OrderStatus | 'all')}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">All Orders</option>
              <option value="Pending Confirmation">Pending Confirmation</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">Loading orders...</div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole="homemaker" // Explicitly set userRole
                  onUpdateStatus={handleStatusChange} // Corrected prop name
                />
              ))}
              {filteredOrders.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No orders found for the selected filter.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderManager;