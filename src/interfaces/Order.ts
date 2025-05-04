import { Meal } from './Meal'; // Assuming Meal interface is defined

export type OrderStatus = 
  | 'Pending Confirmation'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Declined';

export type PaymentMethod = 'COD' | 'UPI' | 'Card';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface OrderItem {
  mealId: string;
  quantity: number;
  price: number;
  mealName?: string;
  mealImage?: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  landmark?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  homemakerId: string;
  homemakerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: Date;
  deliveryAddress: Address;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
  rating?: number;
  feedback?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  cancelReason?: string;
  refundStatus?: 'Pending' | 'Processed' | 'Completed';
}