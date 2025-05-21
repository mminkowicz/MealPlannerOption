import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMeals } from '../context/MealContext';

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
    <View style={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>➕ Add New Item</Text>
      </TouchableOpacity>

      <SectionList
        sections={grouped}
        keyExtractor={(item, index) => item.name + index}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEditItem(item, item._index)}>
                  <Text style={styles.editBtn}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item._index)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
            {item.groceries.map((g, i) => {
              const key = `${item.name}-${g.name}`;
              const isChecked = checkedItems[key];
              return (
                <TouchableOpacity key={i} onPress={() => toggleCheck(item.name, g.name)}>
                  <Text
                    style={[
                      styles.groceryLine,
                      isChecked && styles.groceryLineChecked,
                    ]}
                  >
                    ✅ {g.name} {g.qty ? `(${g.qty})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Dish' : 'Add New Dish'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Dish Name"
            value={itemName}
            onChangeText={setItemName}
          />

          <Text style={styles.label}>Select Type</Text>
          {ITEM_TYPES.map((type) => (
            <Pressable key={type} onPress={() => setItemType(type)}>
              <Text style={itemType === type ? styles.selectedType : styles.unselectedType}>
                {type}
              </Text>
            </Pressable>
          ))}

          {itemType === 'Custom' && (
            <TextInput
              style={styles.input}
              placeholder="Custom Type"
              value={customType}
              onChangeText={setCustomType}
            />
          )}

          <Text style={styles.label}>Grocery Items (Optional)</Text>
          <View style={styles.groceryRow}>
            <TextInput
              style={styles.groceryInput}
              placeholder="Add a grocery item"
              value={groceryInput}
              onChangeText={setGroceryInput}
            />
            <Pressable onPress={handleAddGrocery} style={styles.addGroceryButton}>
              <Text style={{ color: 'white' }}>+</Text>
            </Pressable>
          </View>

          {groceries.map((g, i) => (
            <View key={i} style={styles.groceryListRow}>
              <Text style={{ flex: 1 }}>{g.name}</Text>
              <TextInput
                style={styles.qtyInput}
                placeholder="Qty"
                value={qtyInputs[i] || ''}
                onChangeText={(text) =>
                  setQtyInputs((prev) => ({ ...prev, [i]: text }))
                }
              />
            </View>
          ))}

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.fullButton, { backgroundColor: '#ccc' }]}
              onPress={() => {
                setModalVisible(false);
                resetModalState();
              }}
            >
              <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fullButton, { backgroundColor: '#1e3c72' }]}
              onPress={handleSaveItem}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  addButton: {
    backgroundColor: '#1e3c72',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: 'white', fontSize: 16 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', gap: 10 },
  editBtn: { fontSize: 16, marginRight: 10 },
  deleteBtn: { fontSize: 16 },
  groceryLine: { fontSize: 14, paddingLeft: 10, marginTop: 4 },
  groceryLineChecked: {
    color: 'gray',
    textDecorationLine: 'line-through',
  },
  modal: { flex: 1, padding: 20, backgroundColor: 'white' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
  selectedType: {
    backgroundColor: '#1e3c72',
    color: 'white',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
  },
  unselectedType: {
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
  },
  groceryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  groceryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  addGroceryButton: {
    marginLeft: 10,
    backgroundColor: '#1e3c72',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  groceryListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qtyInput: {
    width: 80,
    marginLeft: 10,
    padding: 6,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
  },
  bottomButtons: {
    marginTop: 30,
    flexDirection: 'column',
    gap: 10,
  },
  fullButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});

