import React from 'react';

interface FilterPanelProps {
  categories: string[]; // Available categories
  selectedCategory: string | null;
  selectedDietary: string | null; // 'Veg', 'Non-Veg', null
  selectedSort: string | null; // 'price-asc', 'price-desc', 'rating-desc'
  onCategoryChange: (category: string | null) => void;
  onDietaryChange: (dietary: string | null) => void;
  onSortChange: (sort: string | null) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategory,
  selectedDietary,
  selectedSort,
  onCategoryChange,
  onDietaryChange,
  onSortChange
}) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Category</h4>
        <select
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Dietary Preference</h4>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input type="radio" name="dietary" value="" checked={!selectedDietary} onChange={() => onDietaryChange(null)} className="mr-1"/> All
          </label>
          <label className="flex items-center">
            <input type="radio" name="dietary" value="Veg" checked={selectedDietary === 'Veg'} onChange={() => onDietaryChange('Veg')} className="mr-1"/> Veg
          </label>
           <label className="flex items-center">
            <input type="radio" name="dietary" value="Non-Veg" checked={selectedDietary === 'Non-Veg'} onChange={() => onDietaryChange('Non-Veg')} className="mr-1"/> Non-Veg
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Sort By</h4>
        <select
          value={selectedSort || ''}
          onChange={(e) => onSortChange(e.target.value || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Rating: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;