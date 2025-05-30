import React from 'react';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  rating: number;
  comment: string;
  date: Date;
  mealId?: string; // Optional - if review is for a specific meal
  homemakerId?: string; // Optional - if review is for a homemaker
}

interface ReviewCardProps {
  review: Review;
  variant?: 'compact' | 'detailed';
}

// Re-use star rendering helper if available, or define locally
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>)}
      {halfStar && <span className="text-yellow-400 text-lg">★</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>)}
    </div>
  );
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">{review.customerName}</h4>
          <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
        </div>
        {renderStars(review.rating)}
      </div>
      <p className="text-sm text-gray-700">{review.comment}</p>
      {review.orderId && <p className="text-xs text-gray-400 mt-1">Order: #{review.orderId.substring(0,6)}...</p>}
    </div>
  );
};

export default ReviewCard;