import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MealsScreen from '../screens/MealsScreen';
import MealDetailScreen from '../screens/MealDetailScreen';

const Stack = createNativeStackNavigator();

export default function MealsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MealsList" component={MealsScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
    </Stack.Navigator>
  );
}
