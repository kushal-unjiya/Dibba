import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import CategoryGrid from '../../components/CategoryGrid';
import MealCard from '../../components/MealCard';
import { Meal } from '../../interfaces/Meal';
import { useAuth } from '../../contexts/AuthContext';

// Define a simple Category type if not already defined elsewhere
interface Category {
  id: string;
  name: string;
  image: string;
}

const Home: React.FC = () => {
  const [featuredMeals, setFeaturedMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed unused error state
  const { user } = useAuth();

  // Placeholder categories - replace with actual data fetching
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Breakfast', image: '/placeholder-image.jpg' },
    { id: '2', name: 'Lunch', image: '/placeholder-image.jpg' },
    { id: '3', name: 'Dinner', image: '/placeholder-image.jpg' },
    { id: '4', name: 'Snacks', image: '/placeholder-image.jpg' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    // ... (fetchFeaturedMeals logic remains the same)
    const fetchFeaturedMeals = async () => {
      try {
        // Assuming your backend endpoint for featured meals is correct
        const response = await fetch('http://localhost:3001/api/meals?featured=true'); // Example: Adjust endpoint if needed
        if (!response.ok) {
          throw new Error('Failed to fetch featured meals');
        }
        const data = await response.json();
        setFeaturedMeals(data);
      } catch (err) {
        console.error('Error fetching featured meals:', err);
        // Optionally set an error state here if you add it back
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMeals();
    // TODO: Fetch actual categories here
    // fetchCategories().then(setCategories);
  }, []);

  const handleSearch = async (query: string) => {
    // ... (search logic remains the same)
    try {
      const response = await fetch(`http://localhost:3001/api/meals/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setFeaturedMeals(data); // Update featuredMeals or a separate searchResults state
    } catch (err) {
      console.error('Search error:', err);
      // Optionally set an error state here if you add it back
    }
  };

  const handleAddToCart = async (meal: Meal) => {
    // ... (add to cart logic remains the same)
    if (!user) {
      console.log('User not logged in, cannot add to cart');
      // Handle unauthenticated user (e.g., redirect to login)
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('Auth token not found');
        return;
      }
      const response = await fetch('http://localhost:3001/api/cart', { // Ensure this endpoint is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mealId: meal.id,
          quantity: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add to cart' }));
        throw new Error(errorData.message || 'Failed to add to cart');
      }
      console.log(`${meal.name} added to cart`);
      // Optionally show a success notification
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Optionally set an error state here if you add it back
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('Selected category:', categoryId);
    setSelectedCategory(categoryId);
    // TODO: Fetch meals for the selected category
    // fetchMealsByCategory(categoryId).then(setDisplayedMeals); // You might need another state for displayed meals
  };

  // ... (loading state rendering remains the same)
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* ... (featured meals section remains the same) ... */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold text-center text-amber-800 mb-6">Today's Specials</h2>
        <div className="bg-gradient-to-r from-amber-200 to-orange-200 p-6 rounded-lg shadow-lg">
          {featuredMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMeals.slice(0, 3).map(meal => (
                <MealCard key={meal.id} meal={meal} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No featured meals available today.</p>
          )}
        </div>
      </section>

      <SearchBar onSearch={handleSearch} placeholder="Search for meals..." className="my-8" />

      {/* Pass required props to CategoryGrid */}
      <section className="my-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Browse by Category</h2>
        <CategoryGrid
          categories={categories} // Pass categories state
          onCategorySelect={handleCategorySelect} // Pass handler function
          selectedCategory={selectedCategory}
        />
      </section>

      {/* Display meals (either featured or based on search/category) */}
      <section className="my-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Popular Choices</h2>
        {/* This section might need adjustment based on whether you show featured, searched, or category-filtered meals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMeals.map(meal => (
            <MealCard key={meal.id} meal={meal} onAddToCart={handleAddToCart} />
          ))}
        </div>
        {featuredMeals.length === 0 && !isLoading && (
           <p className="text-center text-gray-500 mt-4">No meals found matching your criteria.</p>
        )}
      </section>

      {/* ... (link to full menu remains the same) ... */}
      <div className="text-center mt-10">
        <Link
          to="/customer/menu"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-md hover:shadow-lg"
        >
          Browse Full Menu
        </Link>
      </div>
    </div>
  );
};

export default Home;