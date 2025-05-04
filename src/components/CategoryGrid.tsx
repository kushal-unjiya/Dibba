import React from 'react';

interface Category {
  id: string;
  name: string;
  image: string;
  count?: number;
  description?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategory?: string;
  loading?: boolean;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategorySelect,
  selectedCategory,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
            <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`p-4 rounded-lg transition-all ${
            selectedCategory === category.id
              ? 'bg-amber-100 border-2 border-amber-500'
              : 'bg-white hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="aspect-square rounded-lg overflow-hidden mb-2">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900">{category.name}</h3>
          {category.count !== undefined && (
            <p className="text-sm text-gray-500">{category.count} items</p>
          )}
          {category.description && (
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;