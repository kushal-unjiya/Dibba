import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // Adjust path
import EarningsSummary from '../../components/EarningsSummary'; // Adjust path
import OrderCard from '../../components/OrderCard'; // Adjust path
import { Order } from '../../interfaces/Order'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path
import { UserRole } from '../../interfaces/User'; 

const fetchMockHomemakerDashboardData = (homemakerId: string) => {
    console.log("Fetching dashboard data for homemaker:", homemakerId);
    return new Promise<{ summary: { totalEarnings: number; pendingPayout: number; lastPayoutDate?: Date }, recentOrders: Order[] }>((resolve) => {
        setTimeout(() => {
            resolve({
                summary: { totalEarnings: 5850.75, pendingPayout: 1250.50, lastPayoutDate: new Date(Date.now() - 7 * 86400000) },
                recentOrders: [
                    { id: 'ord4', customerId: 'cust456', homemakerId: homemakerId, items: [{ mealId: 'm2', quantity: 1, price: 120 }], totalAmount: 150, status: 'Pending Confirmation', orderDate: new Date(Date.now() - 1800000), deliveryAddress: { street: '789 Pine St', city: 'Villagetown', postalCode: '54321' }, paymentMethod: 'COD', paymentStatus: 'Pending' },
                    { id: 'ord5', customerId: 'cust789', homemakerId: homemakerId, items: [{ mealId: 'm6', quantity: 2, price: 100 }], totalAmount: 230, status: 'Confirmed', orderDate: new Date(Date.now() - 3600000 * 2), deliveryAddress: { street: '101 Maple Dr', city: 'Anytown', postalCode: '12345' }, paymentMethod: 'UPI', paymentStatus: 'Completed' },
                ]
            });
        }, 600);
    });
};

const RoleSelector: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState<{ totalEarnings: number; pendingPayout: number; lastPayoutDate?: Date } | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user.role === 'homemaker') {
      setIsLoading(true);
      fetchMockHomemakerDashboardData(user.id)
        .then(data => {
          setSummaryData(data.summary);
          setRecentOrders(data.recentOrders);
        })
        .catch(err => console.error("Failed to load dashboard data", err))
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false); // Handle case where user is not a homemaker
    }
  }, [user]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
     console.log(`Updating order ${orderId} to ${newStatus}`);
     setRecentOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };

  const handleRoleSelection = (role: UserRole) => {
    switch (role) {
      case 'customer':
        navigate('/customer/home');
        break;
      case 'homemaker':
        navigate('/homemaker-auth');
        break;
      case 'delivery':
        navigate('/delivery-auth');
        break;
      default:
        console.error('Invalid role selected');
    }
  };

  if (isLoading) {
      return (
          <div className="flex">
              <Sidebar role="homemaker" />
              <main className="flex-grow p-6 bg-gray-100">Loading dashboard...</main>
          </div>
      );
  }

   if (!user || user.role !== 'homemaker') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Homemaker.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      {/* Add pl-64 to account for the fixed sidebar width */}
      <main className="flex-grow p-6 bg-gray-50 pl-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Homemaker Dashboard</h1>

        {summaryData && (
          <EarningsSummary
            totalEarnings={summaryData.totalEarnings}
            pendingPayout={summaryData.pendingPayout}
            lastPayoutDate={summaryData.lastPayoutDate}
          />
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole="homemaker"
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent orders found.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default RoleSelector;