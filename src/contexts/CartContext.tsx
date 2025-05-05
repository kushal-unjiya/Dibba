import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Meal } from '../interfaces/Meal'; // Assuming Meal interface is here

// Define the structure for items in the cart
export interface CartItem {
  mealId: string;
  quantity: number;
  price: number; // Price per unit at the time of adding
  mealDetails?: { // Store essential meal details for display and order creation
    name?: string;
    image?: string;
    category?: string;
    homemakerId?: string; // Add homemakerId here
  };
}

// Define the shape of the context value
interface CartContextType {
  items: CartItem[];
  addToCart: (meal: Meal, quantity: number) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from local storage on initial load
    const savedCart = localStorage.getItem('dibbaCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('dibbaCart', JSON.stringify(items));
  }, [items]);

  const addToCart = (meal: Meal, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.mealId === meal.id);

      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(item =>
          item.mealId === meal.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, {
          mealId: meal.id,
          quantity,
          price: meal.price,
          mealDetails: { // Include necessary details
            name: meal.name,
            image: meal.image,
            category: meal.category,
            homemakerId: meal.homemakerId // Ensure homemakerId is included
          }
        }];
      }
    });
  };

  const removeFromCart = (mealId: string) => {
    setItems(prevItems => prevItems.filter(item => item.mealId !== mealId));
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.mealId === mealId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};