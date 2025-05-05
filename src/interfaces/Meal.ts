export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // URL or path
  rating?: number; // Optional rating
  category: string; // e.g., 'North Indian', 'South Indian'
  dietary?: 'Veg' | 'Non-Veg' | 'Vegan'; // Optional dietary info - Added 'Vegan'
  isAvailable: boolean;
  homemakerId: string;
  // Added missing properties
  preparationTime?: number; // Estimated time in minutes
  servingSize?: number; // Number of people it serves
  allergens?: string[]; // List of potential allergens
}