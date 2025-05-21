import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useMeals } from '../context/MealContext';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';

export default function MealsScreen() {
  const { meals, addMeal, updateMeal } = useMeals();
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [search, setSearch] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameId, setRenameId] = useState(null);

  const filteredMeals = meals.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddOrRenameMeal = () => {
    if (!mealName.trim()) return;

    if (isRenaming && renameId) {
      const renamed = meals.map(m =>
        m.id === renameId ? { ...m, name: mealName.trim() } : m
      );
      updateMeal({ ...renamed.find(m => m.id === renameId) });
    } else {
      addMeal({
        id: uuid.v4(),
        name: mealName.trim(),
        groceries: [],
      });
    }

    setMealName('');
    setRenameId(null);
    setIsRenaming(false);
    setModalVisible(false);
  };

  const handleCopyMeal = (meal) => {
    const copiedMeal = {
      ...meal,
      id: uuid.v4(),
      name: `${meal.name} (copy)`,
    };
    addMeal(copiedMeal);
  };

  const handleRename = (meal) => {
    setMealName(meal.name);
    setRenameId(meal.id);
    setIsRenaming(true);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-gray-100 p-5">
      <Text className="text-2xl font-bold mb-5">🍽️ My Meals</Text>

      <TextInput
        placeholder="Search meals..."
        className="bg-white rounded-lg p-3 mb-4 border border-gray-300"
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        className="bg-teal-700 py-4 rounded-lg items-center mb-5"
        onPress={() => {
          setMealName('');
          setIsRenaming(false);
          setModalVisible(true);
        }}
      >
        <Text className="text-white font-bold">➕ Add New Meal</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-lg mb-3 flex-row items-center shadow-md gap-3">
            <TouchableOpacity
              className="flex-1"
              onPress={() => navigation.navigate('MealDetail', { meal: item })}
            >
              <Text className="text-lg">{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCopyMeal(item)}>
              <Text className="text-lg">📋</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRename(item)}>
              <Text className="text-lg">✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-center p-8">
          <View className="bg-white rounded-lg p-6">
            <Text className="text-xl font-bold mb-4">
              {isRenaming ? 'Rename Meal' : 'Add New Meal'}
            </Text>
            <TextInput
              className="border-2 border-teal-700 p-3 rounded-lg"
              placeholder="Meal Name"
              value={mealName}
              onChangeText={setMealName}
            />
            <TouchableOpacity className="bg-teal-700 py-4 rounded-lg items-center mt-5" onPress={handleAddOrRenameMeal}>
              <Text className="text-white font-bold">
                {isRenaming ? 'Rename' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text className="text-red-500 mt-3">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
