import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BetaAnalyticsDashboard } from '../../screens/admin/BetaAnalyticsDashboard';
import { colors } from '../../styles/colors';

// Admin credentials - MUST be set via environment variables
// No fallback values for security
const ADMIN_CREDENTIALS = {
  username: process.env.EXPO_PUBLIC_ADMIN_USERNAME,
  password: process.env.EXPO_PUBLIC_ADMIN_PASSWORD,
  accessCode: process.env.EXPO_PUBLIC_ADMIN_ACCESS_CODE,
};

// Validate that credentials are set
if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password || !ADMIN_CREDENTIALS.accessCode) {
  console.error('Admin credentials not configured. Set EXPO_PUBLIC_ADMIN_* environment variables.');
}

const ADMIN_SESSION_KEY = '@admin_session';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

interface AdminSession {
  timestamp: number;
  authenticated: boolean;
}

interface SecureAnalyticsDashboardProps {
  onClose?: () => void;
}

export const SecureAnalyticsDashboard: React.FC<SecureAnalyticsDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    checkExistingSession();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTime) {
      timer = setTimeout(() => {
        setLockoutTime(null);
        setAttempts(0);
      }, LOCKOUT_DURATION);
    }
    return () => clearTimeout(timer);
  }, [lockoutTime]);

  const checkExistingSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
      if (sessionData) {
        const session: AdminSession = JSON.parse(sessionData);
        const now = Date.now();
        
        // Check if session is still valid
        if (session.authenticated && (now - session.timestamp) < SESSION_DURATION) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear it
          await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    } catch (error) {
      if (__DEV__) console.error('Error checking admin session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Check lockout
    if (lockoutTime) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - (Date.now() - lockoutTime)) / 60000);
      Alert.alert(
        'Account Locked',
        `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate credentials
    const isValidCredentials = 
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password &&
      accessCode === ADMIN_CREDENTIALS.accessCode;

    if (isValidCredentials) {
      try {
        // Create session
        const session: AdminSession = {
          timestamp: Date.now(),
          authenticated: true,
        };
        
        await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        setIsAuthenticated(true);
        setAttempts(0);
        
        // Clear form
        setUsername('');
        setPassword('');
        setAccessCode('');
        
        Alert.alert('Access Granted', 'Welcome to Beta Analytics Dashboard', [{ text: 'Continue' }]);
      } catch (error) {
        Alert.alert('Error', 'Failed to create admin session');
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutTime(Date.now());
        Alert.alert(
          'Access Denied', 
          `Invalid credentials. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Access Denied',
          `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
          [{ text: 'Try Again' }]
        );
      }
      
      // Clear form on failed attempt
      setPassword('');
      setAccessCode('');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
              setIsAuthenticated(false);
              setUsername('');
              setPassword('');
              setAccessCode('');
            } catch (error) {
              if (__DEV__) console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.loadingText}>Checking access...</Text>
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return (
      <SafeAreaView style={styles.authenticatedContainer} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔐 Admin Analytics</Text>
          <View style={styles.headerButtons}>
            {onClose && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕ Close</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BetaAnalyticsDashboard />
      </SafeAreaView>
    );
  }

  const remainingTime = lockoutTime 
    ? Math.ceil((LOCKOUT_DURATION - (Date.now() - lockoutTime)) / 60000)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.loginContainer}>
        {onClose && (
          <TouchableOpacity style={styles.loginCloseButton} onPress={onClose}>
            <Text style={styles.loginCloseButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.title}>Admin Access Required</Text>
          <Text style={styles.subtitle}>Beta Analytics Dashboard</Text>
        </View>

        {lockoutTime && (
          <View style={styles.lockoutContainer}>
            <Text style={styles.lockoutText}>
              🚫 Account locked for {remainingTime} more minutes
            </Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Admin Username</Text>
            <TextInput
              style={[styles.input, lockoutTime ? styles.inputDisabled : null]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter admin username"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              editable={!lockoutTime}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Admin Password</Text>
            <TextInput
              style={[styles.input, lockoutTime ? styles.inputDisabled : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter admin password"
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry
              editable={!lockoutTime}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Access Code</Text>
            <TextInput
              style={[styles.input, lockoutTime ? styles.inputDisabled : null]}
              value={accessCode}
              onChangeText={setAccessCode}
              placeholder="Enter access code"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="characters"
              editable={!lockoutTime}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!username || !password || !accessCode || lockoutTime) ? styles.loginButtonDisabled : null
            ]}
            onPress={handleLogin}
            disabled={!username || !password || !accessCode || !!lockoutTime}
          >
            <Text style={styles.loginButtonText}>
              {lockoutTime ? `Locked (${remainingTime}m)` : 'Access Dashboard'}
            </Text>
          </TouchableOpacity>

          <View style={styles.attemptsContainer}>
            <Text style={[
              styles.attemptsText,
              attempts > 0 ? styles.attemptsTextDanger : styles.attemptsTextNormal
            ]}>
              Failed attempts: {attempts}/{MAX_ATTEMPTS}
            </Text>
          </View>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityNoteText}>
            🛡️ This dashboard contains sensitive beta testing data.
            Unauthorized access is strictly prohibited.
          </Text>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  authenticatedContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  lockoutContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  lockoutText: {
    color: '#D63031',
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  inputDisabled: {
    backgroundColor: colors.background.tertiary,
    color: colors.text.tertiary,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  attemptsContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  attemptsText: {
    fontSize: 12,
  },
  attemptsTextDanger: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  attemptsTextNormal: {
    color: '#666',
    fontWeight: 'normal',
  },
  securityNote: {
    marginTop: 30,
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  securityNoteText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loginCloseButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
});