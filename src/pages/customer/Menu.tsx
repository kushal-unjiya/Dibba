import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MealCard from '../../components/MealCard'; // Adjust path
import FilterPanel from '../../components/FilterPanel'; // Adjust path
import { Meal } from '../../interfaces/Meal'; // Adjust path
import SearchBar from '../../components/SearchBar'; // Adjust path
import { useCart } from '../../contexts/CartContext'; // Import useCart hook
import { mealsAPI } from '../../services/api'; // Import the meals API

const mockCategories = ['North Indian', 'South Indian', 'Thali', 'Healthy', 'Snacks']; // Fetch dynamically

const Menu: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart(); // Get addToCart function from cart context

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedDietary, setSelectedDietary] = useState<string | null>(searchParams.get('dietary'));
  const [selectedSort, setSelectedSort] = useState<string | null>(searchParams.get('sort'));
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');

  useEffect(() => {
    // Fetch meals from API
    setIsLoading(true);
    setError(null);
    
    mealsAPI.getAllMeals()
      .then(data => {
        setMeals(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch meals:', err);
        setError('Failed to load meals. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...meals];

    // Filter by search query
     if (searchQuery) {
        result = result.filter(meal =>
            meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            meal.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(meal => meal.category === selectedCategory);
    }

    // Filter by dietary preference
    if (selectedDietary) {
      result = result.filter(meal => meal.dietary === selectedDietary);
    }

    // Sort results
    if (selectedSort) {
      result.sort((a, b) => {
        switch (selectedSort) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'rating-desc': return (b.rating ?? 0) - (a.rating ?? 0);
          default: return 0;
        }
      });
    }

    setFilteredMeals(result);

    // Update URL search params
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedDietary) params.dietary = selectedDietary;
    if (selectedSort) params.sort = selectedSort;
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params, { replace: true });

  }, [meals, selectedCategory, selectedDietary, selectedSort, searchQuery, setSearchParams]);

  const handleAddToCart = (meal: Meal) => {
    addToCart(meal);
    // Show notification or feedback to user
    alert(`${meal.name} added to your cart!`);
  };

   const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Our Menu</h1>
      <SearchBar onSearch={handleSearch} placeholder="Search within menu..." />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <FilterPanel
            categories={mockCategories}
            selectedCategory={selectedCategory}
            selectedDietary={selectedDietary}
            selectedSort={selectedSort}
            onCategoryChange={setSelectedCategory}
            onDietaryChange={setSelectedDietary}
            onSortChange={setSelectedSort}
          />
        </aside>

        {/* Meal Grid */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          {isLoading ? (
            <div className="text-center py-10">
              <p>Loading meals...</p>
              <div className="mt-4 w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
              >
                Try Again
              </button>
            </div>
          ) : filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMeals.map(meal => (
                <MealCard key={meal.id} meal={meal} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-gray-500">No meals found matching your criteria.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Menu;