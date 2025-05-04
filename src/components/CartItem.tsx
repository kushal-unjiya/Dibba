import React from 'react';
import { CartItem as CartItemType } from '../contexts/CartContext';
import { Meal } from '../interfaces/Meal';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (mealId: string, quantity: number) => void;
  onRemoveItem: (mealId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemoveItem }) => {
  const { mealId, quantity, price, mealDetails } = item;

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onQuantityChange(mealId, newQuantity);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center">
        {mealDetails?.image && (
          <img 
            src={mealDetails.image} 
            alt={mealDetails.name || 'Meal image'} 
            className="w-16 h-16 object-cover rounded-md mr-4"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold">{mealDetails?.name || 'Meal'}</h3>
          <p className="text-gray-600">Price: ₹{price.toFixed(2)}</p>
          {mealDetails?.category && (
            <p className="text-sm text-gray-500">{mealDetails.category}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="w-16 text-center border rounded-md py-1 px-2"
        />
        <button
          onClick={() => onRemoveItem(mealId)}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;