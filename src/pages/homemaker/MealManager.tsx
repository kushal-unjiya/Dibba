import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar'; // Adjust path
import MealForm from '../../components/MealForm'; // Adjust path
import MealList from '../../components/MealList'; // Adjust path
import { Meal } from '../../interfaces/Meal'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path

// Mock Data/API Calls - Replace with actual API interactions
const fetchMockMeals = (homemakerId: string): Promise<Meal[]> => {
    console.log("Fetching meals for homemaker:", homemakerId);
    return new Promise((resolve) => {
        setTimeout(() => resolve([
            { id: 'm2', name: 'Paneer Butter Masala', description: 'Creamy and delicious paneer.', price: 120, image: 'https://via.placeholder.com/300x200/FCA5A5/000000?text=Paneer+Butter', category: 'North Indian', dietary: 'Veg', isAvailable: true, homemakerId: homemakerId, rating: 4.7 },
            { id: 'm6', name: 'Veg Pulao', description: 'Flavorful rice with vegetables.', price: 100, image: 'https://via.placeholder.com/300x200/DDD6FE/000000?text=Veg+Pulao', category: 'North Indian', dietary: 'Veg', isAvailable: true, homemakerId: homemakerId, rating: 4.3 },
            { id: 'm7', name: 'Aloo Paratha (2 pcs)', description: 'Served with curd and pickle.', price: 70, image: 'https://via.placeholder.com/300x200/FDE68A/000000?text=Aloo+Paratha', category: 'Breakfast', dietary: 'Veg', isAvailable: false, homemakerId: homemakerId, rating: 4.6 },
        ]), 500);
    });
};

const addMockMeal = (homemakerId: string, mealData: Omit<Meal, 'id' | 'homemakerId' | 'rating'>): Promise<Meal> => {
     console.log("Adding meal for homemaker:", homemakerId, mealData);
     return new Promise((resolve) => {
        setTimeout(() => resolve({
            ...mealData,
            id: `m${Math.floor(Math.random() * 1000)}`, // Generate mock ID
            homemakerId: homemakerId,
            rating: undefined, // New meals have no rating initially
        }), 300);
     });
};

const updateMockMeal = (mealData: Meal): Promise<Meal> => {
     console.log("Updating meal:", mealData);
     return new Promise((resolve) => {
        setTimeout(() => resolve(mealData), 300); // Return updated data
     });
};

const deleteMockMeal = (mealId: string): Promise<void> => {
     console.log("Deleting meal:", mealId);
     return new Promise((resolve) => {
        setTimeout(() => resolve(), 300);
     });
};


const MealManager: React.FC = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id && user.role === 'homemaker') {
      setIsLoading(true);
      fetchMockMeals(user.id)
        .then(setMeals)
        .catch(err => console.error("Failed to load meals", err))
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const handleAddNewClick = () => {
    setEditingMeal(null);
    setIsFormVisible(true);
  };

  const handleEditClick = (meal: Meal) => {
    setEditingMeal(meal);
    setIsFormVisible(true);
  };

  const handleDeleteClick = async (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      // TODO: Call API to delete
      try {
          await deleteMockMeal(mealId);
          setMeals(prev => prev.filter(m => m.id !== mealId));
      } catch (error) {
          console.error("Failed to delete meal:", error);
          alert("Failed to delete meal. Please try again.");
      }
    }
  };

   const handleToggleAvailability = async (mealId: string, currentAvailability: boolean) => {
        const mealToUpdate = meals.find(m => m.id === mealId);
        if (!mealToUpdate) return;

        const updatedMeal = { ...mealToUpdate, isAvailable: !currentAvailability };
        // Optimistic update
        setMeals(prev => prev.map(m => m.id === mealId ? updatedMeal : m));

        try {
            // TODO: Call API to update availability
            await updateMockMeal(updatedMeal); // Using updateMockMeal for simplicity
        } catch (error) {
            console.error("Failed to update availability:", error);
            alert("Failed to update availability. Please try again.");
            // Revert optimistic update on failure
            setMeals(prev => prev.map(m => m.id === mealId ? mealToUpdate : m));
        }
    };

  const handleFormSubmit = async (mealData: Omit<Meal, 'id' | 'homemakerId' | 'rating'>) => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      if (editingMeal) {
        // Update existing meal
        const updatedData = { ...editingMeal, ...mealData };
        // TODO: Call API to update
        const result = await updateMockMeal(updatedData);
        setMeals(prev => prev.map(m => m.id === result.id ? result : m));
      } else {
        // Add new meal
        // TODO: Call API to add
        const newMeal = await addMockMeal(user.id, mealData);
        setMeals(prev => [newMeal, ...prev]); // Add to the beginning of the list
      }
      setIsFormVisible(false);
      setEditingMeal(null);
    } catch (error) {
      console.error("Failed to save meal:", error);
      alert(`Failed to ${editingMeal ? 'update' : 'add'} meal. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingMeal(null);
  };

   if (!user || user.role !== 'homemaker') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Homemaker.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      {/* Add ml-64 here */}
      <main className="flex-grow p-6 bg-gray-50 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Meal Manager</h1>
          <button
            onClick={handleAddNewClick}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            + Add New Meal
          </button>
        </div>

        {/* Meal Form (conditionally rendered) */}
        {isFormVisible && (
          <div className="mb-6">
            <MealForm
              initialData={editingMeal}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* Meal List */}
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Meals</h2>
          {isLoading ? (
            <p>Loading meals...</p>
          ) : (
            <MealList
              meals={meals}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleAvailability={handleToggleAvailability}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default MealManager;