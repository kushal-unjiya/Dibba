import React, { useState, useEffect } from 'react';
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import { DeliveryOrder } from '../../interfaces/DeliveryOrder';
import { OrderStatus } from '../../interfaces/Order';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryAPI } from '../../services/api';

interface DashboardStats {
  deliveriesToday: number;
  earningsToday: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const currentOrderData = await deliveryAPI.getCurrentOrder(token);
      setCurrentOrder(currentOrderData);

      // TODO: Add stats endpoint to API and replace this
      setStats({
        deliveriesToday: 0,
        earningsToday: 0
      });

      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user.role === 'delivery') {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }

    // Refresh data every minute when there's a current order
    const intervalId = setInterval(() => {
      if (user?.id && user.role === 'delivery' && currentOrder) {
        fetchDashboardData();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      await deliveryAPI.updateOrderStatus(orderId, newStatus, token);
      if (newStatus === 'Delivered') {
        setCurrentOrder(null);
      } else {
        await fetchDashboardData(); // Refresh data to get updated order status
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      // TODO: Add availability toggle endpoint to API
      // await deliveryAPI.updateAvailability(!isAvailable, token);
      setIsAvailable(!isAvailable);
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Failed to update availability. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || user.role !== 'delivery') {
    return <div className="p-6 text-center text-red-600">Access Denied. Please log in as a Delivery Partner.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-4">
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Delivery Dashboard</h1>
              <button
                onClick={handleToggleAvailability}
                disabled={isUpdating || (currentOrder !== null)}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors duration-200 ${
                  isAvailable 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } ${(isUpdating || currentOrder) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? 'Updating...' : isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading dashboard...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={() => fetchDashboardData()} 
                  className="mt-4 text-blue-500 hover:text-blue-600"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Today's Stats */}
                {stats && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500">Today's Deliveries</h3>
                      <p className="text-2xl font-bold text-gray-800">{stats.deliveriesToday}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500">Today's Earnings</h3>
                      <p className="text-2xl font-bold text-gray-800">₹{stats.earningsToday.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Current Order */}
                {currentOrder ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Current Order</h2>
                    <DeliveryOrderCard
                      order={currentOrder}
                      onUpdateStatus={handleUpdateOrderStatus}
                    />
                  </div>
                ) : isAvailable ? (
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600">No current order. Check available orders to start delivering!</p>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600">You are currently offline. Go online to start accepting orders.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;