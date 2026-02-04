import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { X } from 'lucide-react-native';
import { Button, Input } from '../../components/common';
import { useAuthContext } from '../../context/AuthContext';
import { useUserType } from '../../context/UserTypeContext';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { AuthStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuthContext();
  const { setUserType } = useUserType();
  
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 6 characters for consistency with Supabase and LoginScreen
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
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

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Default to 'tenant' since most users will be tenants (BH owners have fixed credentials)
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: 'tenant',
      });
      
      if (result.success) {
        Alert.alert(
          'Welcome!',
          `Account created successfully! You can now explore all features.`,
          [{ text: 'OK' }]
        );
        // Navigation will be handled automatically by AppNavigator
      } else {
        Alert.alert(
          'Signup Failed',
          result.error || 'An error occurred during signup. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Signup Failed',
        'An error occurred during signup. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleClose = () => {
    // Set user type back to tenant to return to main app without authentication
    setUserType('tenant');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={[typography.textStyles.h1, styles.title]}>
              Create Account
            </Text>
            <Text style={[typography.textStyles.body, styles.subtitle]}>
              Create Your Account
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              error={errors.fullName}
              autoCapitalize="words"
            />

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
                placeholder="Create a password"
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
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Text style={styles.passwordToggleText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title={isLoading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSignup}
              disabled={isLoading}
              style={styles.signupButton}
            />
            
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.loader}
              />
            )}

            <View style={styles.loginPrompt}>
              <Text style={[typography.textStyles.body, styles.loginText]}>
                Already have an account?{' '}
                <Text 
                  style={[typography.textStyles.body, styles.loginLink]}
                  onPress={handleLogin}
                >
                  Login
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6], // 24px
    paddingVertical: spacing[8], // 32px
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
    textAlign: 'center',
  },
  form: {
    flex: 1,
    gap: spacing[6], // 24px
  },
  actions: {
    marginTop: spacing[8], // 32px
    gap: spacing[4], // 16px
  },
  signupButton: {
    marginBottom: spacing[3], // 12px
  },
  loader: {
    alignSelf: 'center',
  },
  loginPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6], // 24px
  },
  loginText: {
    color: colors.gray[600],
    textAlign: 'center',
  },
  loginLink: {
    color: colors.primary,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 4,
    zIndex: 1,
  },
  passwordToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});