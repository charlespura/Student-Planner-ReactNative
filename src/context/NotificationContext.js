import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      // For web, use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('notifications_enabled');
        if (saved !== null) {
          setNotificationsEnabled(saved === 'true');
        }
      }
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }
  };

  const toggleNotifications = async (enabled) => {
    setNotificationsEnabled(enabled);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('notifications_enabled', String(enabled));
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Simple notification functions for now
  const scheduleNotification = async (title, body, date) => {
    console.log('Notification scheduled:', { title, body, date });
    // For web, you can use the Notification API
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  };

  const scheduleDailyReminder = async (hour, minute, title, body) => {
    console.log('Daily reminder scheduled:', { hour, minute, title, body });
  };

  const cancelAllNotifications = async () => {
    console.log('All notifications cancelled');
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
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

export default NotificationContext;