import { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderItem, Address } from './Order';
import { Homemaker } from './Homemaker'; // To include pickup address details

export interface DeliveryOrder extends Omit<Order, 'homemakerName' | 'rating' | 'feedback'> {
  pickupAddress: Address;
  deliveryNotes?: string;
  customerContact: {
    name: string;
    phone: string;
    alternatePhone?: string;
  };
  pickupOTP?: string;
  deliveryOTP?: string;
  route?: {
    distance: number; // in kilometers
    estimatedTime: number; // in minutes
  };
  earnings?: {
    baseAmount: number;
    incentives: number;
    total: number;
  };
  deliveryStartTime?: Date;
  isHighPriority?: boolean;
}