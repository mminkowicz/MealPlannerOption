import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MealsStackNavigator from './MealsStackNavigator';
import ExploreScreen from '../screens/ExploreScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          background: 'linear-gradient(to right, #2c3e50, #4ca1af)',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#ecf0f1',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Meals') iconName = 'restaurant';
          else if (route.name === 'Explore') iconName = 'compass-outline';
          else if (route.name === 'Account') iconName = 'person-circle-outline';
          else iconName = 'home-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Meals" component={MealsStackNavigator} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
