import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import { DeliveryOrder } from '../../interfaces/DeliveryOrder';
import { useAuth } from '../../contexts/AuthContext';

// Mock Data/API Calls
const fetchMockAvailableOrders = (deliveryPartnerId: string): Promise<DeliveryOrder[]> => {
    console.log("Fetching available orders for delivery partner:", deliveryPartnerId);
    // In a real app, this would fetch from an API, filtering by 'Ready for Pickup' and proximity
    return new Promise((resolve) => setTimeout(() => {
        const mockOrders: DeliveryOrder[] = [
          {
            id: 'ord9', customerId: 'cust222', homemakerId: 'hm1', items: [{ mealId: 'm2', quantity: 1, price: 120 }], totalAmount: 150, status: 'Ready for Pickup', orderDate: new Date(Date.now() - 3600000 * 3),
            deliveryAddress: { street: '333 Cedar Ave', city: 'Villagetown', postalCode: '54321' }, paymentMethod: 'COD', paymentStatus: 'Pending',
            pickupAddress: { street: '123 Cook St', city: 'Foodville', postalCode: '12345' },
            customerName: 'Customer B', customerPhone: '555-1234'
          },
          {
            id: 'ord11', customerId: 'cust444', homemakerId: 'hm3', items: [{ mealId: 'm4', quantity: 1, price: 80 }], totalAmount: 110, status: 'Ready for Pickup', orderDate: new Date(Date.now() - 3600000 * 1.5),
            deliveryAddress: { street: '555 Walnut Blvd', city: 'Otherville', postalCode: '67890' }, paymentMethod: 'UPI', paymentStatus: 'Completed',
            pickupAddress: { street: '789 Bake Ln', city: 'Otherville', postalCode: '67890' },
            customerName: 'Customer C', customerPhone: '555-5678'
          },
          {
            id: 'ord12', customerId: 'cust555', homemakerId: 'hm2', items: [{ mealId: 'm1', quantity: 2, price: 90 }], totalAmount: 200, status: 'Ready for Pickup', orderDate: new Date(Date.now() - 3600000 * 2),
            deliveryAddress: { street: '111 Pine St', city: 'Foodville', postalCode: '12345' }, paymentMethod: 'COD', paymentStatus: 'Pending',
            pickupAddress: { street: '456 Fry Rd', city: 'Foodville', postalCode: '12345' },
            customerName: 'Customer D', customerPhone: '555-9012'
          }
        ];
        resolve(mockOrders);
    }, 700));
};

const acceptMockOrder = (orderId: string, deliveryPartnerId: string): Promise<void> => {
    console.log(`Delivery partner ${deliveryPartnerId} accepting order ${orderId}`);
    // TODO: API call to assign order to partner
    return new Promise((resolve) => setTimeout(resolve, 300));
};


const OrderList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchOrders = async () => {
      if (!user?.id || user.role !== 'delivery') return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const orders = await fetchMockAvailableOrders(user.id);
        if (mounted) {
          setAvailableOrders(orders);
        }
      } catch (err) {
        console.error("Failed to load available orders", err);
        if (mounted) {
          setError("Failed to load available orders. Please try again later.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
    
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleAcceptOrder = async (orderId: string) => {
    if (!user?.id) return;
    
    const orderToAccept = availableOrders.find(o => o.id === orderId);
    if (!orderToAccept) return;

    // Optimistic update
    setAvailableOrders(prev => prev.filter(o => o.id !== orderId));

    try {
      await acceptMockOrder(orderId, user.id);
      // Navigate to dashboard after successful acceptance
      navigate('/delivery/dashboard');
    } catch (error) {
      console.error("Failed to accept order:", error);
      // Revert optimistic update
      setAvailableOrders(prev => 
        orderToAccept ? [orderToAccept, ...prev].sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        ) : prev
      );
      alert("Failed to accept order. Please try again.");
    }
  };

  if (!user || user.role !== 'delivery') {
    return <div className="p-6 text-center text-red-600">Access Denied. Please log in as a Delivery Partner.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="delivery" />
      <main className="flex-grow p-6 bg-gray-100">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Available Orders</h1>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading available orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 text-blue-500 hover:text-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : availableOrders.length > 0 ? (
            <div className="space-y-4">
              {availableOrders.map(order => (
                <div key={order.id} className="relative">
                  <DeliveryOrderCard
                    order={order}
                    onUpdateStatus={undefined}
                  />
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm shadow"
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No available orders nearby right now.</p>
              <p className="text-sm text-gray-400 mt-2">Make sure you are online to receive new orders.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderList;