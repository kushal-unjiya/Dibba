import React from 'react';
import { OrderItem } from '../interfaces/Order'; // Assuming OrderItem includes meal details or you fetch them
import { Meal } from '../interfaces/Meal'; // Or pass Meal details directly

interface CartItemProps {
  item: OrderItem & { mealDetails?: Meal }; // Combine OrderItem with optional Meal details
  onQuantityChange: (mealId: string, newQuantity: number) => void;
    onRemove: (mealId: string) => void;
}   
const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const { mealId, quantity, price, mealDetails } = item;

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value);
    if (!isNaN(newQuantity)) {
      onQuantityChange(mealId, newQuantity);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        {mealDetails?.image && (
          <img src={mealDetails.image} alt={mealDetails.name} className="w-16 h-16 mr-4" />
        )}
        <div>
          <h3 className="text-lg font-semibold">{mealDetails?.name || 'Meal Name'}</h3>
          <p className="text-gray-600">Price: ₹{price}</p>
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="number"
          value={quantity}
          min="1"
          onChange={handleQuantityChange}
          className="w-16 text-center border rounded"
        />
        <button
          onClick={() => onRemove(mealId)}
          className="ml-4 text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
export default CartItem;
// This component is styled using Tailwind CSS classes. Adjust the classes as per your design requirements.