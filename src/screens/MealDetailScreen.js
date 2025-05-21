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
      <View style={styles.container}>
        <Text style={styles.title}>{meal.name}</Text>

        <Button mode="contained" onPress={() => setModalVisible(true)} style={styles.addButton}>
          ➕ Add New Item
        </Button>

        <SectionList
          sections={grouped}
          keyExtractor={(item, index) => item.name + index}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title
                title={item.name}
                right={() => (
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleEditItem(item, item._index)}>
                      <Text style={styles.editBtn}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteItem(item._index)}>
                      <Text style={styles.deleteBtn}>🗑️</Text>
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
              </Card.Content>
            </Card>
          )}
        />

        <Portal>
          <PaperModal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
            <ScrollView>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Dish' : 'Add New Dish'}</Text>

              <PaperTextInput
                label="Dish Name"
                value={itemName}
                onChangeText={setItemName}
                mode="outlined"
                style={styles.input}
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
                <PaperTextInput
                  label="Custom Type"
                  value={customType}
                  onChangeText={setCustomType}
                  mode="outlined"
                  style={styles.input}
                />
              )}

              <Text style={styles.label}>Grocery Items (Optional)</Text>
              <View style={styles.groceryRow}>
                <PaperTextInput
                  label="Add a grocery item"
                  value={groceryInput}
                  onChangeText={setGroceryInput}
                  mode="outlined"
                  style={styles.groceryInput}
                />
                <Button mode="contained" onPress={handleAddGrocery} style={styles.addGroceryButton}>
                  +
                </Button>
              </View>

              {groceries.map((g, i) => (
                <View key={i} style={styles.groceryListRow}>
                  <Text style={{ flex: 1 }}>{g.name}</Text>
                  <PaperTextInput
                    label="Qty"
                    value={qtyInputs[i] || ''}
                    onChangeText={(text) =>
                      setQtyInputs((prev) => ({ ...prev, [i]: text }))
                    }
                    mode="outlined"
                    style={styles.qtyInput}
                  />
                </View>
              ))}

              <View style={styles.bottomButtons}>
                <Button mode="contained" onPress={() => {
                  setModalVisible(false);
                  resetModalState();
                }} style={[styles.fullButton, { backgroundColor: '#ccc' }]}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleSaveItem} style={[styles.fullButton, { backgroundColor: '#1e3c72' }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  addButton: {
    backgroundColor: '#00796b',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeader: { fontSize: 22, fontWeight: '700', marginTop: 20 },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 12 },
  editBtn: { fontSize: 18, marginRight: 12 },
  deleteBtn: { fontSize: 18 },
  groceryLine: { fontSize: 16, paddingLeft: 12, marginTop: 6 },
  groceryLineChecked: {
    color: 'gray',
    textDecorationLine: 'line-through',
  },
  modal: { flex: 1, padding: 24, backgroundColor: 'white' },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  input: {
    borderWidth: 2,
    borderColor: '#00796b',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  label: { fontWeight: '700', marginTop: 12, marginBottom: 8 },
  selectedType: {
    backgroundColor: '#00796b',
    color: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  unselectedType: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  groceryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  groceryInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#00796b',
    borderRadius: 8,
    padding: 12,
  },
  addGroceryButton: {
    marginLeft: 12,
    backgroundColor: '#00796b',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  groceryListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qtyInput: {
    width: 80,
    marginLeft: 12,
    padding: 8,
    borderColor: '#00796b',
    borderWidth: 2,
    borderRadius: 8,
  },
  bottomButtons: {
    marginTop: 36,
    flexDirection: 'column',
    gap: 12,
  },
  fullButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
