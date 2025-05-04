import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/SearchBar'; // Adjust path
import CategoryGrid from '../../components/CategoryGrid'; // Adjust path
import MealCard from '../../components/MealCard'; // Adjust path
import { Meal } from '../../interfaces/Meal'; // Adjust path
// Import carousel library if used, e.g., react-slick
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// Mock Data - Replace with API calls
const mockFeaturedMeals: Meal[] = [
  { id: 'm1', name: 'Special Thali', description: 'A complete meal experience.', price: 150, image: 'https://via.placeholder.com/400x200/FCD34D/000000?text=Special+Thali', category: 'Thali', isAvailable: true, homemakerId: 'h1', rating: 4.5 },
  { id: 'm2', name: 'Paneer Butter Masala', description: 'Creamy and delicious paneer.', price: 120, image: 'https://via.placeholder.com/400x200/FCA5A5/000000?text=Paneer+Butter', category: 'North Indian', dietary: 'Veg', isAvailable: true, homemakerId: 'h2', rating: 4.7 },
  { id: 'm3', name: 'Chicken Biryani', description: 'Aromatic and flavorful biryani.', price: 180, image: 'https://via.placeholder.com/400x200/93C5FD/000000?text=Chicken+Biryani', category: 'North Indian', dietary: 'Non-Veg', isAvailable: true, homemakerId: 'h1', rating: 4.8 },
];

const Home: React.FC = () => {
  const [featuredMeals, setFeaturedMeals] = useState<Meal[]>([]);

  useEffect(() => {
    // TODO: Fetch featured meals from API
    setFeaturedMeals(mockFeaturedMeals);
  }, []);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Navigate to menu page with search query or implement search logic
  };

  const handleAddToCart = (meal: Meal) => {
    console.log('Adding to cart:', meal.name);
    // TODO: Implement add to cart logic (e.g., update context state)
  };

  // Carousel settings (example for react-slick)
  // const carouselSettings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true,
  // };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section / Carousel */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold text-center text-amber-800 mb-6">Today's Specials</h2>
        {/* Placeholder for Carousel */}
        <div className="bg-gradient-to-r from-amber-200 to-orange-200 p-6 rounded-lg shadow-lg text-center h-64 flex items-center justify-center">
           <p className="text-2xl text-amber-900 font-semibold">Featured Meal Carousel Placeholder</p>
           {/* <Slider {...carouselSettings}>
             {featuredMeals.map(meal => (
               <div key={meal.id} className="px-2">
                 <img src={meal.image} alt={meal.name} className="w-full h-64 object-cover rounded-lg"/>
                 <h3 className="text-xl font-semibold mt-2">{meal.name}</h3>
               </div>
             ))}
           </Slider> */}
        </div>
      </section>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Featured Meals Section (Optional alternative/addition to carousel) */}
      <section className="my-10">
         <h2 className="text-2xl font-semibold mb-4 text-gray-800">Popular Choices</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMeals.map(meal => (
                <MealCard key={meal.id} meal={meal} onAddToCart={handleAddToCart} />
            ))}
         </div>
      </section>

      {/* CTA Button */}
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