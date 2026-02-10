import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Admin credentials - Load from environment variables (.env file)
const ADMIN_CREDENTIALS = {
  email: process.env.EXPO_PUBLIC_ADMIN_EMAIL,
  password: process.env.EXPO_PUBLIC_ADMIN_PASSWORD,
};

if (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
  throw new Error('Missing required environment variables: EXPO_PUBLIC_ADMIN_EMAIL and EXPO_PUBLIC_ADMIN_PASSWORD. Please check your .env file.');
}

const ADMIN_SESSION_KEY = 'admin_access_granted';

// Platform-agnostic storage helpers
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

export class AdminAccessManager {
  static async checkAdminCredentials(email: string, password: string): Promise<boolean> {
    const isAdminEmail = email.toLowerCase() === ADMIN_CREDENTIALS.email?.toLowerCase();
    const isAdminPassword = password === ADMIN_CREDENTIALS.password;

    if (isAdminEmail && isAdminPassword) {
      await storage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        granted: true,
        timestamp: Date.now(),
        email: email
      }));
      return true;
    }

    return false;
  }

  // Check if admin access is granted for current session
  static async isAdminAccessGranted(): Promise<boolean> {
    try {
      const adminSession = await storage.getItem(ADMIN_SESSION_KEY);
      if (!adminSession) return false;

      const session = JSON.parse(adminSession);
      // Admin access is valid for the entire app session
      return session.granted === true;
    } catch (error) {
      return false;
    }
  }

  // Clear admin access (on logout)
  static async clearAdminAccess(): Promise<void> {
    try {
      await storage.deleteItem(ADMIN_SESSION_KEY);
    } catch (error) {
      // Silently fail if storage operation fails
      if (__DEV__) console.warn('Failed to clear admin access:', error);
    }
  }

  // Get admin session info
  static async getAdminSession(): Promise<{ email: string; timestamp: number } | null> {
    try {
      const adminSession = await storage.getItem(ADMIN_SESSION_KEY);
      if (!adminSession) return null;

      const session = JSON.parse(adminSession);
      return session.granted ? { email: session.email, timestamp: session.timestamp } : null;
    } catch (error) {
      return null;
    }
  }
}

// Environment-specific admin credentials
export const getAdminCredentials = () => ({
  email: ADMIN_CREDENTIALS.email,
  // Don't expose password in production logs
});
