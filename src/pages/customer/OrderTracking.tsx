import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderTimeline from '../../components/OrderTimeline'; // Adjust path
import { Order, OrderStatus } from '../../interfaces/Order'; // Adjust path

// Mock Data - Replace with API call based on orderId
const fetchMockOrder = (id: string): Promise<Order> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: id,
                customerId: 'cust123',
                homemakerId: 'hm123',
                items: [{ mealId: 'm1', quantity: 1, price: 150 }],
                totalAmount: 180,
                status: 'Out for Delivery',
                orderDate: new Date(Date.now() - 3600 * 1000),
                deliveryAddress: { street: '456 Oak Ave', city: 'Otherville', postalCode: '67890' },
                paymentMethod: 'UPI',
                paymentStatus: 'Completed',
                estimatedDeliveryTime: new Date(Date.now() + 3600 * 1000),
                deliveryPartnerId: 'dp123',
                deliveryPartnerName: 'John Delivery',
                deliveryPartnerPhone: '555-0123'
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
        const fetchedOrder = await fetchMockOrder(orderId);
        setOrder(fetchedOrder);

        // Set up real-time updates polling
        // In a real app, this would use WebSocket instead of polling
        const pollInterval = setInterval(async () => {
            try {
                const updatedOrder = await fetchMockOrder(orderId);
                if (updatedOrder.status !== fetchedOrder.status) {
                    setOrder(updatedOrder);
                }
            } catch (err) {
                console.error("Failed to poll order updates:", err);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(pollInterval);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

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
      <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>
      
      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h2 className="text-xl font-semibold">Order #{order.id.substring(0, 8)}...</h2>
                  <p className="text-sm text-gray-500">Placed on: {new Date(order.orderDate).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
              }`}>
                  {order.status}
              </span>
          </div>

          {/* Delivery Partner Info (show only when out for delivery) */}
          {order.status === 'Out for Delivery' && order.deliveryPartnerId && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Delivery Partner Details</h3>
                  <p className="text-sm">{order.deliveryPartnerName}</p>
                  <p className="text-sm">Contact: {order.deliveryPartnerPhone}</p>
              </div>
          )}

          {/* Order Timeline */}
          <div className="mb-4">
              <OrderTimeline events={generateMockEvents(order.status, order.orderDate)} />
          </div>

          <p className="text-sm"><strong>Estimated Delivery:</strong> {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString() : 'N/A'}</p>
          <p className="text-sm"><strong>Delivery Address:</strong> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
      </div>

      {/* Map Placeholder */}
      <div className="border rounded-lg p-4 bg-gray-100 shadow h-64 flex items-center justify-center">
          <p className="text-gray-500">Live Map Placeholder</p>
      </div>

      {/* Support Button */}
      <button className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Need Help with this Order?
      </button>
    </div>
  );
};

export default OrderTracking;