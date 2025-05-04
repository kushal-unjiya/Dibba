import React from 'react';
import { OrderStatus } from '../interfaces/Order';

interface TimelineEvent {
  status: OrderStatus;
  timestamp: Date | string;
  description?: string;
}

interface OrderTimelineProps {
  events: TimelineEvent[]; // Pass sorted events
  currentStatus: OrderStatus;
}

// Define the order of statuses for the timeline
const statusOrder: OrderStatus[] = [
  'Pending Confirmation',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
];

// Define statuses that represent cancellation/failure
const endFailureStatuses: OrderStatus[] = ['Cancelled', 'Declined'];


const OrderTimeline: React.FC<OrderTimelineProps> = ({ events, currentStatus }) => {
  const currentStatusIndex = statusOrder.indexOf(currentStatus);
  const isFailed = endFailureStatuses.includes(currentStatus);

  // Find the timestamp for a given status from the events array
  const getTimestampForStatus = (status: OrderStatus): string => {
    const event = events.find(e => e.status === status);
    return event ? new Date(event.timestamp).toLocaleString() : '';
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold mb-4">Order Status</h3>
      <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">
        {statusOrder.map((status, index) => {
          const isActive = index === currentStatusIndex && !isFailed;
          const isCompleted = index < currentStatusIndex && !isFailed;
          const timestamp = getTimestampForStatus(status);

          // Don't show future steps unless the order is failed/cancelled
          if (!isFailed && !isCompleted && !isActive && !timestamp) {
             return null;
          }

          return (
            <li key={status} className="mb-6 ml-6">
              <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white ${
                isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
              }`}>
                {/* Optional: Add icons */}
                {isCompleted && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
              </span>
              <h4 className={`font-semibold ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'}`}>{status}</h4>
              {timestamp && <time className="block mb-2 text-xs font-normal leading-none text-gray-500">{timestamp}</time>}
              {/* Add description from event if available */}
            </li>
          );
        })}

        {/* Handle Cancelled/Declined Status */}
        {isFailed && (
             <li className="mb-6 ml-6">
               <span className="absolute flex items-center justify-center w-6 h-6 bg-red-500 rounded-full -left-3 ring-4 ring-white">
                 {/* Optional: X icon */}
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
               </span>
               <h4 className="font-semibold text-red-700">{currentStatus}</h4>
               <time className="block mb-2 text-xs font-normal leading-none text-gray-500">{getTimestampForStatus(currentStatus)}</time>
             </li>
        )}
      </ol>
    </div>
  );
};

export default OrderTimeline;