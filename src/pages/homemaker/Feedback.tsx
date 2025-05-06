import React, { useState, useEffect } from 'react';
import ReviewCard from '../../components/ReviewCard'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path

// Mock Data/API Calls
interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: Date | string;
  orderId?: string;
}

const fetchMockReviews = (homemakerId: string): Promise<Review[]> => {
    console.log("Fetching reviews for homemaker:", homemakerId);
    return new Promise((resolve) => {
        setTimeout(() => resolve([
            { id: 'r1', customerName: 'Customer A', rating: 5, comment: 'Absolutely delicious food! Tasted just like home.', date: new Date(Date.now() - 86400000), orderId: 'ord10' },
            { id: 'r2', customerName: 'Customer B', rating: 4, comment: 'Good portion size and tasty. Delivery was a bit late though.', date: new Date(Date.now() - 86400000 * 2), orderId: 'ord_prev1' },
            { id: 'r3', customerName: 'Customer C', rating: 5, comment: 'Excellent packaging and amazing taste!', date: new Date(Date.now() - 86400000 * 3), orderId: 'ord_prev2' },
            { id: 'r4', customerName: 'Customer D', rating: 3, comment: 'Food was okay, could have been warmer.', date: new Date(Date.now() - 86400000 * 4), orderId: 'ord_prev3' },
        ]), 500);
    });
};

const Feedback: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id && user.role === 'homemaker') {
      setIsLoading(true);
      fetchMockReviews(user.id)
        .then(data => {
          setReviews(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort newest first
          // Calculate average rating
          if (data.length > 0) {
              const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
              setAverageRating(totalRating / data.length);
          } else {
              setAverageRating(null);
          }
        })
        .catch(err => console.error("Failed to load reviews", err))
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [user]);

   if (!user || user.role !== 'homemaker') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Homemaker.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <main className="flex-grow p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Ratings & Feedback</h1>

        {/* Average Rating Summary */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Your Average Rating</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : averageRating !== null ? (
                <p className="text-4xl font-bold text-amber-600">{averageRating.toFixed(1)} <span className="text-yellow-400">★</span></p>
            ) : (
                <p className="text-gray-500">No ratings yet.</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</p>
        </div>

        {/* Review List */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Customer Reviews</h2>
          {isLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No reviews received yet.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Feedback;