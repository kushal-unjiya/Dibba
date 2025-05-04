import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Meal } from '../interfaces/Meal';

// Define cart item type
export interface CartItem {
  mealId: string;
  quantity: number;
  price: number;
  mealDetails?: Partial<Meal>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (meal: Meal, quantity?: number) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (meal: Meal, quantity: number = 1) => {
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
          mealDetails: {
            name: meal.name,
            image: meal.image,
            category: meal.category
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

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};