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
          backgroundColor: '#1e3c72',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#ccc',
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
