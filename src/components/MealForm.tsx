import React, { useState, useEffect } from 'react';
import { Meal } from '../interfaces/Meal';

interface MealFormProps {
  initialData?: Meal | null; // Pass existing meal data for editing
  onSubmit: (mealData: Omit<Meal, 'id' | 'homemakerId' | 'rating'>) => void; // Or include ID if updating
  onCancel?: () => void;
  isLoading?: boolean;
}

const MealForm: React.FC<MealFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [dietary, setDietary] = useState<'Veg' | 'Non-Veg' | undefined>(undefined);
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null); // For file upload
  const [imageUrl, setImageUrl] = useState(''); // Or just use a URL input

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(initialData.price);
      setCategory(initialData.category);
      setDietary(initialData.dietary);
      setIsAvailable(initialData.isAvailable);
      setImageUrl(initialData.image); // Assuming image is a URL for editing
    } else {
      // Reset form for adding new
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setDietary(undefined);
      setIsAvailable(true);
      setImageFile(null);
      setImageUrl('');
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0])); // Preview image
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price === '') return; // Basic validation

    // TODO: Handle image upload properly - upload file to storage, get URL
    // For now, just passing the existing/preview URL or a placeholder
    const finalImageUrl = imageUrl || 'https://via.placeholder.com/300x200';

    onSubmit({
      name,
      description,
      price: Number(price),
      category,
      dietary,
      isAvailable,
      image: finalImageUrl, // Use the obtained image URL
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white shadow">
      <h3 className="text-xl font-semibold">{initialData ? 'Edit Meal' : 'Add New Meal'}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Meal Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        {/* TODO: Replace with dynamic categories or a select dropdown */}
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g., North Indian, Snack" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Dietary Type</label>
        <select value={dietary || ''} onChange={(e) => setDietary(e.target.value as 'Veg' | 'Non-Veg' || undefined)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Select (Optional)</option>
            <option value="Veg">Vegetarian</option>
            <option value="Non-Veg">Non-Vegetarian</option>
        </select>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-auto object-cover rounded"/>}
        {/* Or provide an input for image URL */}
        {/* <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Enter Image URL" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/> */}
      </div>
       <div className="flex items-center">
         <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
         <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Available for Ordering</label>
       </div>

      <div className="flex justify-end space-x-2">
        {onCancel && <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>}
        <button type="submit" disabled={isLoading} className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Meal' : 'Add Meal')}
        </button>
      </div>
    </form>
  );
};

export default MealForm;