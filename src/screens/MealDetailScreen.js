import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMeals } from '../context/MealContext';
import { Card, Button, TextInput as PaperTextInput, Modal as PaperModal, Portal, Provider } from 'react-native-paper';
import { Animated } from 'react-native';

const ITEM_TYPES = ['Meat', 'Dairy', 'Drink', 'Appetizer', 'Fish', 'Dessert', 'Custom'];

export default function MealDetailScreen() {
  const route = useRoute();
  const { meal: passedMeal } = route.params;
  const { updateMeal } = useMeals();

  const [meal, setMeal] = useState(passedMeal);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState(ITEM_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [groceries, setGroceries] = useState([]);
  const [groceryInput, setGroceryInput] = useState('');
  const [qtyInputs, setQtyInputs] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleAddGrocery = () => {
    if (!groceryInput.trim()) return;
    setGroceries([...groceries, { name: groceryInput.trim(), qty: '' }]);
    setGroceryInput('');
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) return;

    const newItem = {
      name: itemName.trim(),
      type: itemType === 'Custom' ? customType.trim() : itemType,
      groceries: groceries.map((g, i) => ({
        name: g.name,
        qty: qtyInputs[i] || '',
      })),
    };

    let updatedGroceries = [...(meal.groceries || [])];
    if (isEditing && editIndex !== null) {
      updatedGroceries[editIndex] = newItem;
    } else {
      updatedGroceries.push(newItem);
    }

    const updatedMeal = {
      ...meal,
      groceries: updatedGroceries,
    };

    updateMeal(updatedMeal);
    setMeal(updatedMeal);
    setModalVisible(false);
    resetModalState();
  };

  const resetModalState = () => {
    setItemName('');
    setItemType(ITEM_TYPES[0]);
    setCustomType('');
    setGroceries([]);
    setGroceryInput('');
    setQtyInputs({});
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleEditItem = (item, index) => {
    setItemName(item.name);
    setItemType(ITEM_TYPES.includes(item.type) ? item.type : 'Custom');
    setCustomType(ITEM_TYPES.includes(item.type) ? '' : item.type);
    setGroceries(item.groceries || []);
    setQtyInputs(
      item.groceries.reduce((acc, g, i) => {
        acc[i] = g.qty;
        return acc;
      }, {})
    );
    setIsEditing(true);
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleDeleteItem = (index) => {
    const updatedGroceries = meal.groceries.filter((_, i) => i !== index);
    const updatedMeal = { ...meal, groceries: updatedGroceries };
    updateMeal(updatedMeal);
    setMeal(updatedMeal);
  };

  const toggleCheck = (dishName, groceryName) => {
    const key = `${dishName}-${groceryName}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const grouped = (meal.groceries || []).reduce((acc, item, index) => {
    const group = acc.find((g) => g.title === item.type);
    const entry = { ...item, _index: index };
    if (group) {
      group.data.push(entry);
    } else {
      acc.push({ title: item.type, data: [entry] });
    }
    return acc;
  }, []);

  return (
    <Provider>
      <View className="flex-1 p-5 bg-gray-100">
        <Text className="text-2xl font-bold mb-5">{meal.name}</Text>

        <Button mode="contained" onPress={() => setModalVisible(true)} className="bg-teal-700 py-3 rounded-lg mb-5">
          ➕ Add New Item
        </Button>

        <SectionList
          sections={grouped}
          keyExtractor={(item, index) => item.name + index}
          renderSectionHeader={({ section }) => (
            <Text className="text-xl font-bold mt-5">{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <Card className="bg-white p-4 rounded-lg my-2">
              <Card.Title
                title={item.name}
                right={() => (
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => handleEditItem(item, item._index)}>
                      <Text className="text-lg mr-3">✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteItem(item._index)}>
                      <Text className="text-lg">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              <Card.Content>
                {item.groceries.map((g, i) => {
                  const key = `${item.name}-${g.name}`;
                  const isChecked = checkedItems[key];
                  return (
                    <TouchableOpacity key={i} onPress={() => toggleCheck(item.name, g.name)}>
                      <Text
                        className={`text-base pl-3 mt-1 ${isChecked ? 'text-gray-500 line-through' : ''}`}
                      >
                        ✅ {g.name} {g.qty ? `(${g.qty})` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Card.Content>
            </Card>
          )}
        />

        <Portal>
          <PaperModal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ flex: 1, padding: 24, backgroundColor: 'white' }}>
            <ScrollView>
              <Text className="text-2xl font-bold mb-6">{isEditing ? 'Edit Dish' : 'Add New Dish'}</Text>

              <PaperTextInput
                label="Dish Name"
                value={itemName}
                onChangeText={setItemName}
                mode="outlined"
                className="border-2 border-teal-700 p-3 rounded-lg mb-4"
              />

              <Text className="font-bold mt-3 mb-2">Select Type</Text>
              {ITEM_TYPES.map((type) => (
                <Pressable key={type} onPress={() => setItemType(type)}>
                  <Text className={`p-3 mb-2 rounded-lg ${itemType === type ? 'bg-teal-700 text-white' : 'bg-teal-100'}`}>
                    {type}
                  </Text>
                </Pressable>
              ))}

              {itemType === 'Custom' && (
                <PaperTextInput
                  label="Custom Type"
                  value={customType}
                  onChangeText={setCustomType}
                  mode="outlined"
                  className="border-2 border-teal-700 p-3 rounded-lg mb-4"
                />
              )}

              <Text className="font-bold mt-3 mb-2">Grocery Items (Optional)</Text>
              <View className="flex-row mb-4">
                <PaperTextInput
                  label="Add a grocery item"
                  value={groceryInput}
                  onChangeText={setGroceryInput}
                  mode="outlined"
                  className="flex-1 border-2 border-teal-700 rounded-lg p-3"
                />
                <Button mode="contained" onPress={handleAddGrocery} className="ml-3 bg-teal-700 rounded-lg px-4 justify-center">
                  +
                </Button>
              </View>

              {groceries.map((g, i) => (
                <View key={i} className="flex-row items-center mb-3">
                  <Text className="flex-1">{g.name}</Text>
                  <PaperTextInput
                    label="Qty"
                    value={qtyInputs[i] || ''}
                    onChangeText={(text) =>
                      setQtyInputs((prev) => ({ ...prev, [i]: text }))
                    }
                    mode="outlined"
                    className="w-20 ml-3 p-2 border-2 border-teal-700 rounded-lg"
                  />
                </View>
              ))}

              <View className="mt-9 flex-col gap-3">
                <Button mode="contained" onPress={() => {
                  setModalVisible(false);
                  resetModalState();
                }} className="py-4 rounded-lg items-center bg-gray-400">
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleSaveItem} className="py-4 rounded-lg items-center bg-teal-900">
                  Save
                </Button>
              </View>
            </ScrollView>
          </PaperModal>
        </Portal>
      </View>
    </Provider>
  );
}
