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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');

  const mockCategories: FilterOption[] = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snacks', label: 'Snacks' }
  ];

  const mockDietaryPreferences: FilterOption[] = [
    { value: 'veg', label: 'Vegetarian' },
    { value: 'nonveg', label: 'Non-Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'glutenFree', label: 'Gluten Free' }
  ];

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
    if (selectedDietary.length > 0) {
      result = result.filter(meal => selectedDietary.includes(meal.dietary));
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
    if (selectedDietary.length > 0) params.dietary = selectedDietary.join(',');
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

  const handleDietaryChange = (dietary: string[]) => {
    setSelectedDietary(dietary);
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
            priceRange={priceRange}
            dietaryPreferences={mockDietaryPreferences}
            onCategoryChange={setSelectedCategory}
            onDietaryChange={handleDietaryChange}
            onPriceRangeChange={setPriceRange}
            onReset={() => {
              setSelectedCategory('');
              setSelectedDietary([]);
              setSelectedSort('');
              setPriceRange([0, 1000]);
            }}
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