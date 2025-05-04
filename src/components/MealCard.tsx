import React, { useState } from 'react';
import { Meal } from '../interfaces/Meal';
import { Link } from 'react-router-dom';

interface MealCardProps {
  meal: Meal;
  onAddToCart: (meal: Meal, quantity: number) => void;
  showHomemakerInfo?: boolean;
}

// Helper to render stars
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
    </div>
  );
};

const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  onAddToCart,
  showHomemakerInfo = false
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(meal, quantity);
    setQuantity(1); // Reset quantity after adding to cart
  };

  // Use a simpler placeholder URL if meal.image is missing
  const imageUrl = meal.image || `https://via.placeholder.com/300x200/cccccc/969696?text=No+Image`;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={imageUrl} // Use the potentially updated imageUrl
          alt={meal.name || 'Meal image'} // Ensure alt text is present
          className="w-full h-full object-cover"
          onError={(e) => { 
            // Optional: Handle cases where even the placeholder fails or meal.image is invalid
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = `https://via.placeholder.com/300x200/cccccc/969696?text=Load+Error`; 
          }}
        />
        {!meal.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Currently Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{meal.name}</h3>
          <span className="text-lg font-bold text-amber-600">₹{meal.price.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
            meal.dietary === 'Veg' ? 'bg-green-100 text-green-800' : 
            meal.dietary === 'Non-Veg' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {meal.dietary || 'N/A'}
          </span>
          {meal.rating && renderStars(meal.rating)}
        </div>

        {showHomemakerInfo && meal.homemakerName && (
          <p className="text-sm text-gray-600 mb-2">By: {meal.homemakerName}</p>
        )}

        <p className="text-sm text-gray-500 mb-4">{meal.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="text-gray-500 hover:text-gray-700"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border rounded p-1"
            />
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              className="text-gray-500 hover:text-gray-700"
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!meal.isAvailable}
            className={`px-4 py-2 rounded text-sm font-medium ${
              meal.isAvailable
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealCard;