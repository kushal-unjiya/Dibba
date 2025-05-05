import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import MealForm from '../../components/MealForm';
import MealList from '../../components/MealList';
import { Meal } from '../../interfaces/Meal';
import { useAuth } from '../../contexts/AuthContext';
import { mealsAPI } from '../../services/api';

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
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      mealsAPI.getMealsByHomemaker(user.id)
        .then(setMeals)
        .catch(err => console.error("Failed to load meals", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleSaveMeal = async (mealData: Partial<Meal>) => {
    if (!user || !user.id) return;
    
    setIsSubmitting(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    try {
      if (editingMeal) {
        // Update existing meal
        const updatedData = { ...editingMeal, ...mealData };
        const result = await mealsAPI.updateMeal(editingMeal.id, updatedData, token);
        setMeals(prev => prev.map(m => m.id === result.id ? result : m));
      } else {
        // Add new meal
        const newMeal = await mealsAPI.createMeal(mealData, token);
        setMeals(prev => [newMeal, ...prev]); // Add to the beginning of the list
      }
      setIsFormVisible(false);
      setEditingMeal(null);
    } catch (error: any) { // Catch specific error type
      console.error("Failed to save meal:", error);
      // Display a more informative error message
      alert(`Failed to ${editingMeal ? 'update' : 'add'} meal. Error: ${error.message || 'Unknown error'}. Please check console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      try {
        await mealsAPI.deleteMeal(mealId, token);
        setMeals(prev => prev.filter(m => m.id !== mealId));
      } catch (error) {
        console.error("Failed to delete meal:", error);
        alert("Failed to delete meal. Please try again.");
      }
    }
  };

  const handleAddNewClick = () => {
    setEditingMeal(null);
    setIsFormVisible(true);
  };

  const handleEditClick = (meal: Meal) => {
    setEditingMeal(meal);
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingMeal(null);
  };

  if (!user || user.role !== 'homemaker') {
    return <div className="p-6 text-center text-red-600">Access Denied. Please log in as a Homemaker.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      <main className="flex-grow p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Meal Manager</h1>
            <button
              onClick={handleAddNewClick}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add New Meal
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading meals...</div>
          ) : (
            <>
              {isFormVisible && (
                <MealForm
                  initialMeal={editingMeal} // Corrected prop name from 'meal' to 'initialMeal'
                  onSubmit={handleSaveMeal} // Renamed from onSave to match MealForm prop
                  onCancel={handleCancelForm}
                  isSubmitting={isSubmitting}
                />
              )}
              <MealList
                meals={meals}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MealManager;