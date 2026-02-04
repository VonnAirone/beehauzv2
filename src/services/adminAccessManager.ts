import AsyncStorage from '@react-native-async-storage/async-storage';

// Admin credentials - should match your login credentials
const ADMIN_CREDENTIALS = {
  email: process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'admin@beehauz.com',
  password: process.env.EXPO_PUBLIC_ADMIN_PASSWORD || 'BetaAnalytics2025!',
};

const ADMIN_SESSION_KEY = '@admin_access_granted';

export class AdminAccessManager {
  // Check if current login credentials match admin credentials
  static async checkAdminCredentials(email: string, password: string): Promise<boolean> {
    const isAdminEmail = email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
    const isAdminPassword = password === ADMIN_CREDENTIALS.password;
    
    if (isAdminEmail && isAdminPassword) {
      // Grant admin access for this session
      await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
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
      const adminSession = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
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
    await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
  }

  // Get admin session info
  static async getAdminSession(): Promise<{ email: string; timestamp: number } | null> {
    try {
      const adminSession = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
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
  passwordHint: 'BeehauxAdmin2025!',
});