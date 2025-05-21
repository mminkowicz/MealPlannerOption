import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MealContext = createContext();

export function MealProvider({ children }) {
  const [meals, setMeals] = useState([]);

  // Load meals from storage on startup
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const stored = await AsyncStorage.getItem('meals');
        if (stored) {
          setMeals(JSON.parse(stored));
        }
      } catch (e) {
        console.log('Error loading meals:', e);
      }
    };

    loadMeals();
  }, []);

  // Save meals to storage on change
  useEffect(() => {
    const saveMeals = async () => {
      try {
        await AsyncStorage.setItem('meals', JSON.stringify(meals));
      } catch (e) {
        console.log('Error saving meals:', e);
      }
    };

    saveMeals();
  }, [meals]);

  const addMeal = (meal) => {
    setMeals([...meals, meal]);
  };

  const updateMeal = (updatedMeal) => {
    setMeals((prev) =>
      prev.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal))
    );
  };

  const value = {
    meals,
    addMeal,
    updateMeal,
  };

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
}

export function useMeals() {
  return useContext(MealContext);
}
