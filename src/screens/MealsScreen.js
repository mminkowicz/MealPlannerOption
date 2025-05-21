import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
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
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ My Meals</Text>

      <TextInput
        placeholder="Search meals..."
        style={styles.searchBar}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setMealName('');
          setIsRenaming(false);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>➕ Add New Meal</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('MealDetail', { meal: item })}
            >
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCopyMeal(item)}>
              <Text style={styles.icon}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRename(item)}>
              <Text style={styles.icon}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isRenaming ? 'Rename Meal' : 'Add New Meal'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Meal Name"
              value={mealName}
              onChangeText={setMealName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddOrRenameMeal}>
              <Text style={styles.saveButtonText}>
                {isRenaming ? 'Rename' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'red', marginTop: 12 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 10 },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: '#00796b',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  cardText: { fontSize: 18 },
  icon: { fontSize: 18 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 2,
    borderColor: '#00796b',
    padding: 12,
    borderRadius: 10,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#00796b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: '700' },
});
