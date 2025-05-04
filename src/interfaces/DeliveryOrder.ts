// This interface might be used specifically for the data needed by the delivery partner view.
// It could extend the base Order or select specific fields.
import { Order } from './Order';
import { Homemaker } from './Homemaker'; // To include pickup address details

export interface DeliveryOrder extends Omit<Order, 'customerId' | 'rating' | 'feedback'> { // Example: Omit fields not relevant to delivery partner
  pickupAddress: Homemaker['address']; // Get address structure from Homemaker
  customerName: string; // Add customer name for delivery
  customerPhone: string; // Add customer phone for delivery
  // Add any other delivery-specific fields like calculated distance, estimated earnings for this delivery, etc.
}