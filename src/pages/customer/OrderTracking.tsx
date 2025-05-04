import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderTimeline from '../../components/OrderTimeline'; // Adjust path
import { Order, OrderStatus } from '../../interfaces/Order'; // Adjust path

// Mock Data - Replace with API call based on orderId
const fetchMockOrder = (id: string): Promise<Order> => {
    console.log("Fetching mock order for ID:", id);
    // Simulate different statuses based on ID or random chance
    let status: OrderStatus = 'Pending Confirmation';
    const rand = Math.random();
    if (rand > 0.2) status = 'Confirmed';
    if (rand > 0.4) status = 'Preparing';
    if (rand > 0.6) status = 'Ready for Pickup';
    if (rand > 0.8) status = 'Out for Delivery';
    // if (rand > 0.9) status = 'Delivered'; // Less likely for active tracking
    // if (id.includes('fail')) status = 'Cancelled'; // Example failure case

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: id,
                customerId: 'cust123',
                homemakerId: 'hm123',
                items: [{ mealId: 'm1', quantity: 1, price: 150 }],
                totalAmount: 180, // Including delivery
                status: status,
                orderDate: new Date(Date.now() - 3600 * 1000), // 1 hour ago
                deliveryAddress: { street: '456 Oak Ave', city: 'Otherville', postalCode: '67890' },
                paymentMethod: 'UPI',
                paymentStatus: 'Completed',
                estimatedDeliveryTime: new Date(Date.now() + 3600 * 1000), // 1 hour from now
            });
        }, 500);
    });
};

// Mock events based on status
const generateMockEvents = (orderStatus: OrderStatus, orderDate: Date) => {
    const events = [{ status: 'Pending Confirmation' as OrderStatus, timestamp: orderDate }];
    if (['Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'].includes(orderStatus)) {
        events.push({ status: 'Confirmed', timestamp: new Date(orderDate.getTime() + 5 * 60000) }); // +5 mins
    }
     if (['Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'].includes(orderStatus)) {
        events.push({ status: 'Preparing', timestamp: new Date(orderDate.getTime() + 15 * 60000) }); // +15 mins
    }
     if (['Ready for Pickup', 'Out for Delivery', 'Delivered'].includes(orderStatus)) {
        events.push({ status: 'Ready for Pickup', timestamp: new Date(orderDate.getTime() + 30 * 60000) }); // +30 mins
    }
     if (['Out for Delivery', 'Delivered'].includes(orderStatus)) {
        events.push({ status: 'Out for Delivery', timestamp: new Date(orderDate.getTime() + 40 * 60000) }); // +40 mins
    }
     if (orderStatus === 'Delivered') {
        events.push({ status: 'Delivered', timestamp: new Date(orderDate.getTime() + 60 * 60000) }); // +60 mins
    }
     if (orderStatus === 'Cancelled' || orderStatus === 'Declined') {
         events.push({ status: orderStatus, timestamp: new Date(orderDate.getTime() + 10 * 60000) }); // +10 mins
     }
    return events;
};


const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not provided.");
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        const fetchedOrder = await fetchMockOrder(orderId);
        setOrder(fetchedOrder);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    // Optional: Set up polling or WebSocket for real-time updates
    // const intervalId = setInterval(fetchOrder, 30000); // Poll every 30 seconds
    // return () => clearInterval(intervalId); // Cleanup on unmount

  }, [orderId]);

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Loading order details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="container mx-auto p-6 text-center text-gray-500">Order not found.</div>;
  }

  const timelineEvents = generateMockEvents(order.status, order.orderDate);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Track Order #{order.id.substring(0, 8)}...</h1>
      <p className="text-gray-600 mb-6">Status updated as of: {new Date().toLocaleTimeString()}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Timeline */}
        <div className="md:col-span-2">
          <OrderTimeline events={timelineEvents} currentStatus={order.status} />
        </div>

        {/* Order Summary & Map Placeholder */}
        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
            <p className="text-sm"><strong>Total Items:</strong> {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p className="text-sm"><strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}</p>
            <p className="text-sm"><strong>Estimated Delivery:</strong> {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString() : 'N/A'}</p>
             <p className="text-sm"><strong>Delivery Address:</strong> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
          </div>

          {/* Map Placeholder */}
          <div className="border rounded-lg p-4 bg-gray-100 shadow h-64 flex items-center justify-center">
            <p className="text-gray-500">Live Map Placeholder</p>
            {/* TODO: Integrate a map library (e.g., Leaflet, Google Maps) */}
          </div>

           {/* Support Button */}
           <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Need Help with this Order?
           </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;