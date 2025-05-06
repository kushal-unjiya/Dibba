import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import { DeliveryOrder } from '../../interfaces/DeliveryOrder';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryAPI } from '../../services/api';

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && user.role === 'delivery') {
      fetchAvailableOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchAvailableOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');
      
      const orders = await deliveryAPI.getAvailableOrders(token);
      setAvailableOrders(orders);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch available orders:", err);
      setError("Failed to load available orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      await deliveryAPI.updateOrderStatus(orderId, newStatus, token);
      // Remove the order from available orders list
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      
      if (newStatus === 'Out for Delivery') {
        navigate('/delivery/dashboard');
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Please try again.");
    }
  };

  if (!user || user.role !== 'delivery') {
    return <div className="p-6 text-center text-red-600">Access Denied. Please log in as a Delivery Partner.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-grow p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Available Orders</h1>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading available orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => fetchAvailableOrders()} 
                className="mt-4 text-blue-500 hover:text-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : availableOrders.length > 0 ? (
            <div className="space-y-4">
              {availableOrders.map(order => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No orders available for delivery at the moment.</p>
              <button 
                onClick={() => fetchAvailableOrders()} 
                className="mt-4 text-blue-500 hover:text-blue-600"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderList;