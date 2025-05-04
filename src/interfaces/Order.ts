import { Meal } from './Meal'; // Assuming Meal interface is defined

export type OrderStatus =
  | 'Pending Confirmation' // Initial state
  | 'Confirmed' // Homemaker accepted
  | 'Declined' // Homemaker declined
  | 'Preparing' // Food is being made
  | 'Ready for Pickup' // Ready for delivery partner
  | 'Out for Delivery' // Delivery partner has picked up
  | 'Delivered' // Customer received
  | 'Cancelled'; // Order cancelled (by customer or system)

export interface OrderItem {
  mealId: string;
  quantity: number;
  price: number; // Price at the time of order for this item
  mealDetails?: Partial<Meal>; // Optional: Include some meal details like name/image
}

export interface Order {
  id: string;
  customerId: string;
  homemakerId: string;
  deliveryPartnerId?: string; // Assigned when picked up
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: Date;
  deliveryAddress: { // More structured address
    street: string;
    city: string;
    postalCode: string;
    landmark?: string;
  };
  deliveryInstructions?: string;
  paymentMethod: 'UPI' | 'COD' | 'Card';
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  rating?: number; // Customer rating for the order
  feedback?: string; // Customer feedback
}