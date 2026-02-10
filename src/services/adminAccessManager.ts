import * as SecureStore from 'expo-secure-store';

// Admin credentials - Load from environment variables (.env file)
const ADMIN_CREDENTIALS = {
  email: process.env.EXPO_PUBLIC_ADMIN_EMAIL,
  password: process.env.EXPO_PUBLIC_ADMIN_PASSWORD,
};

if (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
  throw new Error('Missing required environment variables: EXPO_PUBLIC_ADMIN_EMAIL and EXPO_PUBLIC_ADMIN_PASSWORD. Please check your .env file.');
}

const ADMIN_SESSION_KEY = 'admin_access_granted';

export class AdminAccessManager {
  static async checkAdminCredentials(email: string, password: string): Promise<boolean> {
    const isAdminEmail = email.toLowerCase() === ADMIN_CREDENTIALS.email?.toLowerCase();
    const isAdminPassword = password === ADMIN_CREDENTIALS.password;

    if (isAdminEmail && isAdminPassword) {
      await SecureStore.setItemAsync(ADMIN_SESSION_KEY, JSON.stringify({
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
      const adminSession = await SecureStore.getItemAsync(ADMIN_SESSION_KEY);
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
    await SecureStore.deleteItemAsync(ADMIN_SESSION_KEY);
  }

  // Get admin session info
  static async getAdminSession(): Promise<{ email: string; timestamp: number } | null> {
    try {
      const adminSession = await SecureStore.getItemAsync(ADMIN_SESSION_KEY);
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
