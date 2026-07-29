import StorageService from './StorageService';

const SETTINGS_KEY = '@settings';
const THEME_KEY = '@theme_preference';
const NOTIFICATIONS_KEY = '@notifications_enabled';

class SettingsStorage {
  static async getSettings() {
    return await StorageService.getData(SETTINGS_KEY) || {
      theme: 'system',
      notifications: true,
      language: 'en',
    };
  }

  static async saveSettings(settings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await StorageService.saveData(SETTINGS_KEY, updatedSettings);
    return updatedSettings;
  }

  static async getThemePreference() {
    return await StorageService.getData(THEME_KEY) || 'system';
  }

  static async saveThemePreference(theme) {
    await StorageService.saveData(THEME_KEY, theme);
    return theme;
  }

  static async getNotificationSettings() {
    const value = await StorageService.getData(NOTIFICATIONS_KEY);
    return value !== null ? value : true;
  }

  static async saveNotificationSettings(enabled) {
    await StorageService.saveData(NOTIFICATIONS_KEY, enabled);
    return enabled;
  }

  static async clearAllData() {
    await StorageService.clearAllData();
    return true;
  }
}

export default SettingsStorage;