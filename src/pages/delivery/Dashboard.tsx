import React, { useState, useEffect } from 'react';
// Remove unused navigate import
import Sidebar from '../../components/Sidebar';
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import { DeliveryOrder } from '../../interfaces/DeliveryOrder';
import { OrderStatus } from '../../interfaces/Order';
import { useAuth } from '../../contexts/AuthContext';

// Mock Data/API Calls
const fetchMockDeliveryDashboardData = (deliveryPartnerId: string) => {
    console.log("Fetching dashboard data for delivery partner:", deliveryPartnerId);
    return new Promise<{ currentOrder: DeliveryOrder | null, stats: { deliveriesToday: number, earningsToday: number } }>((resolve) => {
        // Simulate having a current order sometimes
        const hasCurrentOrder = Math.random() > 0.5;
        setTimeout(() => {
            resolve({
                currentOrder: hasCurrentOrder ? {
                    id: 'ord9', customerId: 'cust222', homemakerId: 'hm1', items: [{ mealId: 'm2', quantity: 1, price: 120 }], totalAmount: 150, status: 'Out for Delivery', orderDate: new Date(Date.now() - 3600000 * 3),
                    deliveryAddress: { street: '333 Cedar Ave', city: 'Villagetown', postalCode: '54321' }, paymentMethod: 'COD', paymentStatus: 'Pending', deliveryPartnerId: deliveryPartnerId,
                    pickupAddress: { street: '123 Cook St', city: 'Foodville', postalCode: '12345' }, // Added pickup address
                    customerName: 'Customer B', customerPhone: '555-1234' // Added customer details
                } : null,
                stats: { deliveriesToday: hasCurrentOrder ? 3 : 4, earningsToday: hasCurrentOrder ? 95.50 : 120.00 }
            });
        }, 600);
    });
};

const updateMockDeliveryOrderStatus = (orderId: string, newStatus: OrderStatus): Promise<void> => {
    console.log(`Updating delivery order ${orderId} to ${newStatus}`);
    return new Promise((resolve) => setTimeout(resolve, 300));
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  // Remove unused navigate declaration
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [stats, setStats] = useState<{ deliveriesToday: number; earningsToday: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDashboardData = async (userId: string) => {
    try {
      const data = await fetchMockDeliveryDashboardData(userId);
      setCurrentOrder(data.currentOrder);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      if (!user?.id || user.role !== 'delivery') return;

      setIsLoading(true);
      try {
        await fetchDashboardData(user.id);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDashboard();

    // Optional: Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      if (user?.id) {
        fetchDashboardData(user.id);
      }
    }, 30000); // Poll every 30 seconds

    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, [user]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!user?.id || isUpdating) return;

    setIsUpdating(true);
    const previousOrder = currentOrder;

    // Optimistic update
    setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);

    try {
      await updateMockDeliveryOrderStatus(orderId, newStatus);
      
      if (newStatus === 'Delivered') {
        // Refresh dashboard data after successful delivery
        await fetchDashboardData(user.id);
        
        // Show success message
        alert('Order delivered successfully!');
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      // Revert optimistic update
      setCurrentOrder(previousOrder);
      setError("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAvailability = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);

    try {
      // TODO: Implement actual API call
      // await updateAvailabilityStatus(user.id, newAvailability);
      console.log("Availability toggled to:", newAvailability);
    } catch (error) {
      console.error("Failed to update availability:", error);
      // Revert on failure
      setIsAvailable(!newAvailability);
      setError("Failed to update availability. Please try again.");
    }
  };

  if (!user || user.role !== 'delivery') {
    return <div className="p-6 text-center text-red-600">Access Denied. Please log in as a Delivery Partner.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="delivery" />
      {/* Add pl-64 to account for the fixed sidebar width */}
      <main className="flex-grow p-6 bg-gray-100 pl-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Delivery Dashboard</h1>
            <button
              onClick={handleToggleAvailability}
              disabled={isUpdating}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors duration-200 ${
                isAvailable 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAvailable ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Current Order Section */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Current Delivery</h2>
                {currentOrder ? (
                  <DeliveryOrderCard 
                    order={currentOrder} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    {isAvailable ? (
                      <>
                        <p>No active delivery right now.</p>
                        <p className="text-sm mt-2">Check the Available Orders section for new orders.</p>
                      </>
                    ) : (
                      <p>You are currently offline. Go online to start receiving orders.</p>
                    )}
                  </div>
                )}
              </section>

              {/* Stats Section */}
              {stats && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Deliveries Today</h3>
                    <p className="text-3xl font-semibold text-gray-900">{stats.deliveriesToday}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Earnings Today (Est.)</h3>
                    <p className="text-3xl font-semibold text-gray-900">₹{stats.earningsToday.toFixed(2)}</p>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;