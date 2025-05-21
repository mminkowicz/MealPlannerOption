import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MealProvider } from './src/context/MealContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <MealProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </MealProvider>
  );
}
