import React from 'react';
import { Link } from 'react-router-dom';

// Mock data - replace with data fetched from API or state
const categories = [
  { name: 'North Indian', slug: 'north-indian', image: 'https://via.placeholder.com/150/F9A825/FFFFFF?text=North+Indian' },
  { name: 'South Indian', slug: 'south-indian', image: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=South+Indian' },
  { name: 'Thalis', slug: 'thalis', image: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=Thalis' },
  { name: 'Snacks', slug: 'snacks', image: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=Snacks' },
  // Add more categories
];

const CategoryGrid: React.FC = () => {
  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Explore Categories</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            to={`/customer/menu?category=${category.slug}`} // Link to menu page with category filter
            className="block group border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200"
          >
            <img src={category.image} alt={category.name} className="w-full h-32 object-cover" />
            <div className="p-3 text-center">
              <h4 className="font-medium text-gray-700 group-hover:text-amber-600">{category.name}</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;