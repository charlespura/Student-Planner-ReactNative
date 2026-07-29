import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import SettingsStorage from '../services/storage/SettingsStorage';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    loadNotificationSettings();
    registerForPushNotifications();
    
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  const loadNotificationSettings = async () => {
    const settings = await SettingsStorage.getNotificationSettings();
    if (settings !== null) {
      setNotificationsEnabled(settings);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  const scheduleNotification = async (title, body, date, data = {}) => {
    if (!notificationsEnabled) return;

    try {
      const trigger = new Date(date);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });
      
      console.log('Notification scheduled for:', trigger);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const scheduleDailyReminder = async (hour, minute, title, body) => {
    if (!notificationsEnabled) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      
      console.log('Daily reminder scheduled for:', `${hour}:${minute}`);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  };

  const toggleNotifications = async (enabled) => {
    setNotificationsEnabled(enabled);
    await SettingsStorage.saveNotificationSettings(enabled);
    
    if (!enabled) {
      await cancelAllNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        expoPushToken,
        toggleNotifications,
        scheduleNotification,
        scheduleDailyReminder,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};