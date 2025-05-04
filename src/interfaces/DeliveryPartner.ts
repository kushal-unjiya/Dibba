import { User } from './User';
import { BankDetails } from './Homemaker'; // Re-use BankDetails

export interface VehicleDetails {
  type: 'Bike' | 'Scooter' | 'Cycle' | 'Other';
  registrationNumber: string;
  model?: string;
}

export interface DeliveryPartner extends User {
  role: 'delivery';
  vehicleDetails?: VehicleDetails;
  currentLocation?: { lat: number; lng: number }; // For live tracking
  isAvailable: boolean; // Available to take deliveries?
  bankDetails?: BankDetails;
  averageRating?: number;
  currentOrderId?: string; // ID of the order currently being delivered
}