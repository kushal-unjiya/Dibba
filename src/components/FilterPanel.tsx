import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPanelProps {
  categories: FilterOption[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  dietaryPreferences: FilterOption[];
  selectedDietary: string[];
  onDietaryChange: (dietary: string[]) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  dietaryPreferences,
  selectedDietary,
  onDietaryChange,
  onReset
}) => {
  const [minPrice, maxPrice] = priceRange;

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    if (type === 'min') {
      onPriceRangeChange([numValue, maxPrice]);
    } else {
      onPriceRangeChange([minPrice, numValue]);
    }
  };

  const handleDietaryToggle = (value: string) => {
    if (selectedDietary.includes(value)) {
      onDietaryChange(selectedDietary.filter(d => d !== value));
    } else {
      onDietaryChange([...selectedDietary, value]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reset All
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range (₹)
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            placeholder="Min"
            className="w-1/2 p-2 border rounded-md"
            min={0}
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            placeholder="Max"
            className="w-1/2 p-2 border rounded-md"
            min={minPrice}
          />
        </div>
      </div>

      {/* Dietary Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dietary Preferences
        </label>
        <div className="space-y-2">
          {dietaryPreferences.map(({ value, label }) => (
            <label key={value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedDietary.includes(value)}
                onChange={() => handleDietaryToggle(value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;