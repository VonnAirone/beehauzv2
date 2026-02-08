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
import { Eye, EyeOff } from 'lucide-react-native';
import { Input } from '../../components/common';
import { useAuthContext } from '../../context/AuthContext';
import { useUserType } from '../../context/UserTypeContext';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { AuthStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'OwnerSignup'>;

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

export const OwnerSignupScreen: React.FC = () => {
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
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

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
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: 'owner',
      });

      if (result.success) {
        Alert.alert(
          'Welcome!',
          'Owner account created successfully! You can now list your properties.',
          [{ text: 'OK' }]
        );
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
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={[typography.textStyles.h1, styles.title]}>
                Create Owner Account
              </Text>
              <Text style={[typography.textStyles.body, styles.subtitle]}>
                List your properties and manage bookings.
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
                  {showPassword ? (
                    <EyeOff size={18} color={colors.primary} />
                  ) : (
                    <Eye size={18} color={colors.primary} />
                  )}
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
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={colors.primary} />
                  ) : (
                    <Eye size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.createAccount} onPress={handleSignup}>
                <Text style={styles.primaryActionText}>
                  {isLoading ? 'Creating Account...' : 'Create Owner Account'}
                </Text>
              </TouchableOpacity>

              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.loader}
                />
              )}

              <TouchableOpacity style={styles.signUpButton} onPress={handleLogin}>
                <Text style={styles.secondaryActionText}>Log in</Text>
              </TouchableOpacity>
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
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[6],
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: spacing[6],
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    color: colors.black,
    marginBottom: spacing[3],
  },
  subtitle: {
    color: colors.gray[600],
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    gap: spacing[4],
  },
  actions: {
    marginTop: spacing[8],
    gap: spacing[4],
  },
  loader: {
    alignSelf: 'center',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 44,
    padding: 4,
    zIndex: 1,
  },
  createAccount: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  signUpButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
