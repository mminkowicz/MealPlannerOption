import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMeals } from '../context/MealContext';

export default function AccountScreen() {
  const { meals, updateMeal } = useMeals();

  const handleResetApp = async () => {
    Alert.alert(
      'Reset App',
      'Are you sure you want to delete all meals?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('meals');
            updateMeal({}); // This can be adjusted depending on how your context handles updates
            Alert.alert('Reset', 'All meals have been deleted.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'This is just a placeholder. Add auth to enable.');
  };

  return (
    <View className="flex-1 p-8 bg-teal-100">
      <Text className="text-4xl font-bold mb-8">👤 My Account</Text>

      <View className="bg-white p-5 rounded-xl mb-8">
        <Text className="text-gray-600 font-semibold mt-2">Name</Text>
        <Text className="text-lg mt-1">Mendel Minkowicz</Text>

        <Text className="text-gray-600 font-semibold mt-2">Email</Text>
        <Text className="text-lg mt-1">mminkowicz@gmail.com</Text>
      </View>

      <TouchableOpacity className="bg-teal-700 py-4 rounded-xl mb-4 items-center" onPress={handleResetApp}>
        <Text className="text-white font-bold">🗑️ Reset App (Delete All Meals)</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-teal-900 py-4 rounded-xl items-center" onPress={handleLogout}>
        <Text className="text-white font-bold">🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
