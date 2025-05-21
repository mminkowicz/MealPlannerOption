import React from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <View style={styles.container}>
      <Text style={styles.header}>👤 My Account</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>Mendel Minkowicz</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>mminkowicz@gmail.com</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleResetApp}>
        <Text style={styles.buttonText}>🗑️ Reset App (Delete All Meals)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logout]} onPress={handleLogout}>
        <Text style={styles.buttonText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#e0f7fa' },
  header: { fontSize: 32, fontWeight: '700', marginBottom: 30 },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  label: { color: '#666', fontWeight: '600', marginTop: 10 },
  value: { fontSize: 16, marginTop: 2 },
  button: {
    backgroundColor: '#00796b',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '700' },
  logout: {
    backgroundColor: '#004d40',
  },
});
