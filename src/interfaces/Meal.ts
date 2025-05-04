export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // URL or path
  rating?: number; // Optional rating
  category: string; // e.g., 'North Indian', 'South Indian'
  dietary?: 'Veg' | 'Non-Veg'; // Optional dietary info
  isAvailable: boolean;
  homemakerId: string;
}