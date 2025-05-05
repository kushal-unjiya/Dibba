import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderTimeline from '../../components/OrderTimeline';
import { Order, OrderStatus } from '../../interfaces/Order';
import { DeliveryPartner } from '../../interfaces/DeliveryPartner';
import { ordersAPI } from '../../services/api';

interface TimelineEvent {
  status: OrderStatus;
  timestamp: Date;
  description?: string;
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not provided.");
      setIsLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No auth token found');

        // Get order details
        const orderDetails = await ordersAPI.getOrderById(orderId, token);
        setOrder(orderDetails);

        // Fetch delivery partner details if assigned
        if (orderDetails.deliveryPartnerId) {
          const partnerDetails = await ordersAPI.getDeliveryPartner(orderDetails.deliveryPartnerId, token);
          setDeliveryPartner(partnerDetails);
        }

        // Convert status updates to timeline events
        const events = await ordersAPI.getOrderStatusHistory(orderId, token);
        setTimelineEvents(events.map(event => ({
          status: event.status,
          timestamp: new Date(event.timestamp),
          description: event.description
        })));

        // Set up real-time updates polling
        const pollInterval = setInterval(async () => {
          try {
            const [updatedOrder, updatedEvents] = await Promise.all([
              ordersAPI.getOrderById(orderId, token),
              ordersAPI.getOrderStatusHistory(orderId, token)
            ]);
            
            if (updatedOrder.status !== orderDetails.status) {
              setOrder(updatedOrder);
              
              // Update delivery partner if changed or newly assigned
              if (updatedOrder.deliveryPartnerId !== orderDetails.deliveryPartnerId) {
                if (updatedOrder.deliveryPartnerId) {
                  const partnerDetails = await ordersAPI.getDeliveryPartner(updatedOrder.deliveryPartnerId, token);
                  setDeliveryPartner(partnerDetails);
                } else {
                  setDeliveryPartner(null);
                }
              }

              setTimelineEvents(updatedEvents.map(event => ({
                status: event.status,
                timestamp: new Date(event.timestamp),
                description: event.description
              })));
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

    fetchOrderData();
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>
      
      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Order #{order.id}</h2>
            <p className="text-gray-600">Status: {order.status}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">{new Date(order.orderDate).toLocaleString()}</p>
            <p className="font-semibold">₹{order.totalAmount}</p>
          </div>
        </div>

        {/* Delivery Partner Info */}
        {deliveryPartner && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Delivery Partner</h3>
            <p className="text-sm">{deliveryPartner.name}</p>
            <p className="text-sm">Contact: {deliveryPartner.phone}</p>
          </div>
        )}

        {/* Order Timeline */}
        <div className="mb-4">
          <OrderTimeline 
            events={timelineEvents}
            currentStatus={order.status}
            isHomemaker={false}
          />
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
        Contact Support
      </button>
    </div>
  );
};

export default OrderTracking;