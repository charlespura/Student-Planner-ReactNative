import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import SettingsStorage from '../../services/storage/SettingsStorage';

export default function SettingsScreen() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications } = useNotifications();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await SettingsStorage.clearAllData();
            Alert.alert('Success', 'All data has been cleared');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, label, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={icon} size={22} color="#007AFF" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : (
        <Icon name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <Text style={styles.subtitle}>Customize your app experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingItem
          icon="moon-outline"
          label="Dark Mode"
          value={themeMode === 'dark'}
          onValueChange={(value) => toggleTheme(value ? 'dark' : 'light')}
        />
        <SettingItem
          icon="color-palette-outline"
          label="System Theme"
          value={themeMode === 'system'}
          onValueChange={(value) => toggleTheme(value ? 'system' : 'light')}
          type="switch"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="notifications-outline"
          label="Enable Notifications"
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="time-outline" size={22} color="#FF9500" />
            </View>
            <Text style={styles.settingLabel}>Daily Reminder</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFEBEE' }]}>
              <Icon name="trash-outline" size={22} color="#FF3B30" />
            </View>
            <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Clear All Data</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="cloud-upload-outline" size={22} color="#34C759" />
            </View>
            <Text style={styles.settingLabel}>Backup Data</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="cloud-download-outline" size={22} color="#FF9500" />
            </View>
            <Text style={styles.settingLabel}>Restore Data</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutContainer}>
          <View style={styles.aboutIcon}>
            <Icon name="school" size={48} color="#007AFF" />
          </View>
          <Text style={styles.aboutTitle}>Student Planner</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutText}>Your all-in-one academic companion</Text>
          <View style={styles.aboutFeatures}>
            <View style={styles.featureTag}>
              <Icon name="checkmark-circle" size={14} color="#34C759" />
              <Text style={styles.featureText}>Offline First</Text>
            </View>
            <View style={styles.featureTag}>
              <Icon name="checkmark-circle" size={14} color="#34C759" />
              <Text style={styles.featureText}>No Login Required</Text>
            </View>
            <View style={styles.featureTag}>
              <Icon name="checkmark-circle" size={14} color="#34C759" />
              <Text style={styles.featureText}>100% Free</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    padding: 12,
    paddingBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  aboutContainer: {
    alignItems: 'center',
    padding: 20,
  },
  aboutIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  aboutVersion: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  aboutFeatures: {
    flexDirection: 'row',
    marginTop: 12,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});