import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Eye, EyeOff, X } from 'lucide-react-native';
import { Button, Input } from '../../components/common';
import { useAuthContext } from '../../context/AuthContext';
import { useUserType } from '../../context/UserTypeContext';
import { supabaseAuthService } from '../../services/supabaseAuth';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { AuthStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginFormData {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuthContext();
  const { setUserType } = useUserType();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        Alert.alert(
          'Welcome back!',
          'You have successfully logged in.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Login Failed',
          result.error || 'Invalid credentials. Please check your email and password.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        'An error occurred during login. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Coming Soon',
      'Password reset functionality is coming soon. Please contact support if you need assistance with your account.',
      [{ text: 'OK' }]
    );
  };

  const handleClose = () => {
    setUserType('tenant');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.page}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={[typography.textStyles.h1, styles.title]}>
                Welcome Back
              </Text>
              <Text style={[typography.textStyles.body, styles.subtitle]}>
                Sign in to continue exploring accredited boarding houses.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  error={errors.password}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.primary} />
                  ) : (
                    <Eye size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={[typography.textStyles.caption, styles.forgotText]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={{color: colors.white, fontSize: 16, fontWeight:'600'}}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
              </TouchableOpacity>
              
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.loader}
                />
              )}

              <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
                <Text style={{color: colors.primary, fontSize: 16, fontWeight:'600'}}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[6],
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 40,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  closeButton: {
    position: 'absolute',
    top: spacing[4], // 16px
    right: spacing[4], // 16px
    padding: spacing[2], // 8px
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8], // 32px
  },
  title: {
    color: colors.black,
    marginBottom: spacing[3], // 12px
  },
  subtitle: {
    color: colors.gray[600],
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: spacing[6], // 24px
    marginBottom: spacing[8], // 32px
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing[3], // -12px
  },
  forgotText: {
    color: colors.primary,
  },
  actions: {
    gap: spacing[4], // 16px
  },
  loginButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.primary
  },
  signUpButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.primary,
    color: colors.primary
  },
  loader: {
    alignSelf: 'center',
  },
  signupPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6], // 24px
  },
  signupText: {
    color: colors.gray[600],
    textAlign: 'center',
  },
  signupLink: {
    color: colors.primary,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 42,
    padding: 4,
    zIndex: 1,
  },
  passwordToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});