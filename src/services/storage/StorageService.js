import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  static async saveData(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  static async getData(key) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  static async deleteData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }

  static async clearAllData() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  static async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }
}

export default StorageService;