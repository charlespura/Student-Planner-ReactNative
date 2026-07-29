import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen';
import AssignmentsScreen from './src/screens/Assignments/AssignmentsScreen';
import NotesScreen from './src/screens/Notes/NotesScreen';

// Theme Context
const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = React.useState(false);
  const toggleTheme = () => setIsDark(!isDark);
  
  const theme = {
    colors: {
      background: isDark ? '#000000' : '#F2F2F7',
      card: isDark ? '#1C1C1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#000000',
      primary: '#007AFF',
      border: isDark ? '#38383A' : '#E5E5EA',
      secondary: isDark ? '#8E8E93' : '#666666',
    },
    isDark,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => React.useContext(ThemeContext);

// Settings Screen
function SettingsScreen() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.screenTitle, { color: theme.colors.text }]}>⚙️ Settings</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity style={styles.settingItem} onPress={theme.toggleTheme}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name={theme.isDark ? 'sunny' : 'moon'} size={22} color="#007AFF" />
            </View>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {theme.isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="notifications" size={22} color="#FF9500" />
            </View>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="information-circle" size={22} color="#34C759" />
            </View>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>About</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.colors.card, marginTop: 12 }]}>
        <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>Student Planner</Text>
        <Text style={[styles.aboutVersion, { color: theme.colors.secondary }]}>Version 1.0.0</Text>
        <Text style={[styles.aboutText, { color: theme.colors.secondary }]}>
          All data is stored locally on your device
        </Text>
        <Text style={[styles.aboutText, { color: theme.colors.secondary }]}>
          No internet connection required
        </Text>
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Schedule') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Tasks') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Notes') {
                iconName = focused ? 'document-text' : 'document-text-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E5EA',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
            },
          })}
        >
          <Tab.Screen name="Home" component={DashboardScreen} />
          <Tab.Screen name="Schedule" component={ScheduleScreen} />
          <Tab.Screen name="Tasks" component={AssignmentsScreen} />
          <Tab.Screen name="Notes" component={NotesScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aboutVersion: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  aboutText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});