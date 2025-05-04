export type UserRole = 'customer' | 'homemaker' | 'delivery';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
    currency: string;
  };
  addresses?: {
    id: string;
    type: 'home' | 'work' | 'other';
    address: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  deviceTokens?: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}