import React from 'react';
import { Meal } from '../interfaces/Meal';
import { Link } from 'react-router-dom';

interface MealCardProps {
  meal: Meal;
  onAddToCart: (meal: Meal) => void; // Function to handle adding to cart
}

// Helper to render stars
const renderStars = (rating?: number) => {
  if (rating === undefined || rating === null) return <span className="text-gray-400 text-sm">No rating</span>;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
      {halfStar && <span className="text-yellow-400">☆</span>} {/* Placeholder for half star */}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-300">★</span>)}
      <span className="ml-1 text-xs text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
};


const MealCard: React.FC<MealCardProps> = ({ meal, onAddToCart }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-white flex flex-col">
      <Link to={`/meal/${meal.id}`} className="block"> {/* Optional: Link to a meal detail page */}
        <img src={meal.image || 'https://via.placeholder.com/300x200/EFEFEF/AAAAAA?text=No+Image'} alt={meal.name} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-1">{meal.name}</h3>
        <p className="text-sm text-gray-600 mb-2 flex-grow">{meal.description.substring(0, 60)}...</p> {/* Truncate description */}
        <div className="flex justify-between items-center mb-2">
           <span className={`text-xs font-semibold px-2 py-0.5 rounded ${meal.dietary === 'Veg' ? 'bg-green-100 text-green-800' : meal.dietary === 'Non-Veg' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
             {meal.dietary || 'N/A'}
           </span>
           {renderStars(meal.rating)}
        </div>
         <p className="text-sm text-gray-500 mb-2">Category: {meal.category}</p>
         {/* Add Homemaker info if needed */}
         {/* <p className="text-xs text-gray-500">By: Homemaker Name</p> */}
      </div>
       <div className="p-4 border-t flex justify-between items-center mt-auto">
         <span className="text-xl font-bold text-amber-700">₹{meal.price.toFixed(2)}</span>
         <button
            onClick={() => onAddToCart(meal)}
            disabled={!meal.isAvailable}
            className={`px-4 py-2 rounded text-sm font-medium ${
              meal.isAvailable
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {meal.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </button>
       </div>
    </div>
  );
};

export default MealCard;