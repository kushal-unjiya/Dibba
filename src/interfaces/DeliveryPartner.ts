import { User } from './User';
import { BankDetails } from './Homemaker'; // Re-use BankDetails

export type VehicleType = 'bicycle' | 'motorcycle' | 'scooter' | 'car';

export interface DeliveryPartnerStats {
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  avgRating: number;
  avgDeliveryTime: number;
  onTimeDeliveryRate: number;
}

export interface DeliveryPartnerSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface DeliveryPartner extends User {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  vehicle: {
    type: VehicleType;
    number?: string;
    model?: string;
    color?: string;
  };
  documents: {
    drivingLicense?: string;
    vehicleRegistration?: string;
    insurance?: string;
    idProof?: string;
    addressProof?: string;
  };
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
  };
  stats: DeliveryPartnerStats;
  schedule: DeliveryPartnerSchedule[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  rating: number;
  registrationDate: Date;
  lastActive?: Date;
  preferredAreas?: string[];
  maxConcurrentOrders?: number;
  currentOrderId?: string;
}