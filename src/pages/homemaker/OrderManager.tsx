import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar'; // Adjust path
import OrderCard from '../../components/OrderCard'; // Adjust path
import { Order, OrderStatus } from '../../interfaces/Order'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path

// Mock Data/API Calls
const fetchMockHomemakerOrders = (homemakerId: string, statusFilter?: OrderStatus): Promise<Order[]> => {
    console.log(`Fetching orders for homemaker ${homemakerId} with status ${statusFilter || 'All'}`);
    return new Promise((resolve) => {
        const allOrders: Order[] = [
             { id: 'ord4', customerId: 'cust456', homemakerId: homemakerId, items: [{ mealId: 'm2', quantity: 1, price: 120 }], totalAmount: 150, status: 'Pending Confirmation', orderDate: new Date(Date.now() - 1800000), deliveryAddress: { street: '789 Pine St', city: 'Villagetown', postalCode: '54321' }, paymentMethod: 'COD', paymentStatus: 'Pending' },
             { id: 'ord5', customerId: 'cust789', homemakerId: homemakerId, items: [{ mealId: 'm6', quantity: 2, price: 100 }], totalAmount: 230, status: 'Confirmed', orderDate: new Date(Date.now() - 3600000 * 2), deliveryAddress: { street: '101 Maple Dr', city: 'Anytown', postalCode: '12345' }, paymentMethod: 'UPI', paymentStatus: 'Completed' },
             { id: 'ord8', customerId: 'cust111', homemakerId: homemakerId, items: [{ mealId: 'm7', quantity: 1, price: 70 }], totalAmount: 100, status: 'Preparing', orderDate: new Date(Date.now() - 3600000 * 1), deliveryAddress: { street: '222 Birch Ln', city: 'Otherville', postalCode: '67890' }, paymentMethod: 'Card', paymentStatus: 'Completed' },
             { id: 'ord9', customerId: 'cust222', homemakerId: homemakerId, items: [{ mealId: 'm2', quantity: 1, price: 120 }], totalAmount: 150, status: 'Ready for Pickup', orderDate: new Date(Date.now() - 3600000 * 3), deliveryAddress: { street: '333 Cedar Ave', city: 'Villagetown', postalCode: '54321' }, paymentMethod: 'COD', paymentStatus: 'Pending' },
             { id: 'ord10', customerId: 'cust333', homemakerId: homemakerId, items: [{ mealId: 'm6', quantity: 1, price: 100 }], totalAmount: 130, status: 'Delivered', orderDate: new Date(Date.now() - 86400000), deliveryAddress: { street: '444 Spruce St', city: 'Anytown', postalCode: '12345' }, paymentMethod: 'UPI', paymentStatus: 'Completed', actualDeliveryTime: new Date(Date.now() - 86400000 + 3600000) },
        ];
        setTimeout(() => {
            const filtered = statusFilter ? allOrders.filter(o => o.status === statusFilter) : allOrders;
            resolve(filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())); // Sort newest first
        }, 500);
    });
};

const updateMockOrderStatus = (orderId: string, newStatus: OrderStatus): Promise<Order> => {
    console.log(`Updating mock order ${orderId} to ${newStatus}`);
    return new Promise((resolve, reject) => {
        // Simulate API call
        setTimeout(() => {
            // Find the order (in a real scenario, the backend does this)
            // For mock, just return a structure indicating success
             resolve({ id: orderId, status: newStatus } as Order); // Return partial update
        }, 300);
    });
};

const OrderManager: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>(''); // '' means All

  const orderStatuses: OrderStatus[] = [
      'Pending Confirmation', 'Confirmed', 'Preparing', 'Ready for Pickup',
      'Out for Delivery', 'Delivered', 'Cancelled', 'Declined'
  ];

  useEffect(() => {
    if (user?.id && user.role === 'homemaker') {
      setIsLoading(true);
      fetchMockHomemakerOrders(user.id, statusFilter || undefined)
        .then(setOrders)
        .catch(err => console.error("Failed to load orders", err))
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [user, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic update
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      // TODO: Call API to update status
      await updateMockOrderStatus(orderId, newStatus);
      // Optional: Refetch orders for the current filter if API doesn't return full updated object
      // or if optimistic update isn't sufficient (e.g., status change removes it from current filter)
       if (statusFilter && newStatus !== statusFilter) {
           setOrders(prev => prev.filter(o => o.id !== orderId)); // Remove if it no longer matches filter
       }

    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error);
      alert("Failed to update order status. Please try again.");
      // Revert optimistic update on failure
      setOrders(originalOrders);
    }
  };

   if (!user || user.role !== 'homemaker') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Homemaker.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      <main className="flex-grow p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Manager</h1>

        {/* Filter Controls */}
        <div className="mb-6">
          <label htmlFor="statusFilter" className="mr-2 font-medium">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="p-2 border rounded bg-white shadow-sm"
          >
            <option value="">All Active Orders</option>
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Order List */}
        <section>
          {isLoading ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole="homemaker"
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No orders found matching the filter.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default OrderManager;