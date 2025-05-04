export type UserRole = 'customer' | 'homemaker' | 'delivery' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePictureUrl?: string;
  createdAt: Date;
}

// Example of extending for specific roles if needed later
export interface Customer extends User {
  role: 'customer';
  addresses?: string[]; // Array of address IDs or full addresses
  orderHistory?: string[]; // Array of Order IDs
}