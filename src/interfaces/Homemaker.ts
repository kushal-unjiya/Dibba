import { User } from './User';
import { Address } from './Order';

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string; // Changed from accountHolder
  bankName?: string;
  upiId?: string;
}

export interface HomemakerRating {
  overall: number;
  taste: number;
  packaging: number;
  hygiene: number;
  delivery: number;
  value: number;
}

export interface HomemakerStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalEarnings: number;
  avgRating: number;
  activeMenuItems: number;
}

export interface HomemakerSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isAvailable: boolean;
  openTime?: string;
  closeTime?: string;
  maxOrders?: number;
}

export interface Homemaker extends User {
  id: string;
  userId: string;
  name: string;
  description?: string;
  email: string;
  phone: string;
  address: Address;
  profileImage?: string;
  kitchenImages?: string[];
  fssaiLicense?: string; // Moved from certificates
  otherCertificates?: string[]; // Moved from certificates
  specialties?: string[];
  cuisineTypes?: string[];
  isVerified: boolean;
  isActive: boolean;
  ratings: HomemakerRating;
  stats: HomemakerStats;
  schedule: HomemakerSchedule[];
  bankDetails?: BankDetails; // Use the updated BankDetails interface
  documents?: {
    idProof?: string;
    addressProof?: string;
    registrationCertificate?: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  registrationDate: Date;
  lastActive?: Date;
}