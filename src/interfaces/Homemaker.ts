import { User } from './User';

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  upiId?: string;
}

export interface Homemaker extends User {
  role: 'homemaker';
  kitchenName: string;
  address: { // Kitchen address
    street: string;
    city: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };
  bankDetails?: BankDetails;
  fssaiLicense?: string; // Optional FSSAI details
  isActive: boolean; // Homemaker accepting orders?
  averageRating?: number;
  speciality?: string[]; // e.g., ['North Indian', 'Vegan']
  // mealIds?: string[]; // Could be fetched separately
}