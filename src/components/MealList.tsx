import React from 'react';
import { Meal } from '../interfaces/Meal';

interface MealListProps {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
  onToggleAvailability?: (mealId: string, currentAvailability: boolean) => void; // Optional
}

const MealList: React.FC<MealListProps> = ({ meals, onEdit, onDelete, onToggleAvailability }) => {
  if (!meals || meals.length === 0) {
    return <p className="text-center text-gray-500 py-4">No meals added yet.</p>;
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <div key={meal.id} className="flex items-center justify-between p-3 border rounded bg-white shadow-sm hover:shadow">
          <div className="flex items-center space-x-3">
             <img src={meal.image || 'https://via.placeholder.com/60x40'} alt={meal.name} className="w-16 h-12 object-cover rounded"/>
             <div>
                <h4 className="font-medium">{meal.name}</h4>
                <p className="text-sm text-gray-600">₹{meal.price.toFixed(2)} - {meal.category}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${meal.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {meal.isAvailable ? 'Available' : 'Unavailable'}
                </span>
             </div>
          </div>
          <div className="flex space-x-2">
            {onToggleAvailability && (
                 <button
                    onClick={() => onToggleAvailability(meal.id, meal.isAvailable)}
                    className={`text-xs px-2 py-1 rounded ${meal.isAvailable ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                 >
                    {meal.isAvailable ? 'Make Unavailable' : 'Make Available'}
                 </button>
            )}
            <button onClick={() => onEdit(meal)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            <button onClick={() => onDelete(meal.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealList;