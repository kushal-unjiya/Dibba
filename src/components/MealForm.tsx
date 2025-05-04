import React, { useState, useEffect } from 'react';
import { Meal } from '../interfaces/Meal';

interface MealFormProps {
  initialMeal?: Partial<Meal>;
  onSubmit: (mealData: Omit<Meal, 'id' | 'homemakerId' | 'homemakerName'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MealForm: React.FC<MealFormProps> = ({
  initialMeal,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Omit<Meal, 'id' | 'homemakerId' | 'homemakerName'>>({
    name: initialMeal?.name || '',
    description: initialMeal?.description || '',
    price: initialMeal?.price || 0,
    category: initialMeal?.category || '',
    dietary: initialMeal?.dietary || 'Veg',
    image: initialMeal?.image || '',
    isAvailable: initialMeal?.isAvailable ?? true,
    preparationTime: initialMeal?.preparationTime || 30,
    servingSize: initialMeal?.servingSize || 1,
    rating: initialMeal?.rating || 0,
    allergens: initialMeal?.allergens || []
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialMeal?.image || null);
  const [errors, setErrors] = useState<Partial<Record<keyof Meal, string>>>({});

  useEffect(() => {
    if (initialMeal) {
      setFormData(prev => ({
        ...prev,
        ...initialMeal
      }));
      if (initialMeal.image) {
        setImagePreview(initialMeal.image);
      }
    }
  }, [initialMeal]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Meal, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.preparationTime <= 0) {
      newErrors.preparationTime = 'Preparation time must be greater than 0';
    }
    
    if (formData.servingSize <= 0) {
      newErrors.servingSize = 'Serving size must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData(prev => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-amber-500 focus:ring-amber-500`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`mt-1 block w-full rounded-md border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-amber-500 focus:ring-amber-500`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className={`mt-1 block w-full rounded-md border ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-amber-500 focus:ring-amber-500`}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className={`mt-1 block w-full rounded-md border ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-amber-500 focus:ring-amber-500`}
            >
              <option value="">Select Category</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
              <option value="Desserts">Desserts</option>
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dietary Type</label>
            <select
              value={formData.dietary}
              onChange={(e) => setFormData(prev => ({ ...prev, dietary: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="Veg">Vegetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preparation Time (minutes)</label>
            <input
              type="number"
              min="1"
              value={formData.preparationTime}
              onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
              className={`mt-1 block w-full rounded-md border ${
                errors.preparationTime ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-amber-500 focus:ring-amber-500`}
            />
            {errors.preparationTime && <p className="mt-1 text-sm text-red-600">{errors.preparationTime}</p>}
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Meal Image</label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />
        </div>
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
          </div>
        )}
      </div>

      {/* Availability Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
        />
        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
          Available for Order
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : initialMeal ? 'Update Meal' : 'Add Meal'}
        </button>
      </div>
    </form>
  );
};

export default MealForm;