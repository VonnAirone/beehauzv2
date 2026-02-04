import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Save } from 'lucide-react-native';
import { Button, Input, Dropdown, PhoneInput, DropdownOption } from '../../../components/common';
import { useAuthContext } from '../../../context/AuthContext';
import { supabaseAuthService } from '../../../services/supabaseAuth';
import { TenantStackParamList } from '../../../navigation/types';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { COUNTRY_CODES, POPULAR_SCHOOLS } from '../../../utils/constants';

type EditProfileScreenNavigationProp = StackNavigationProp<TenantStackParamList, 'EditProfile'>;

interface ProfileFormData {
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  university: string;
  yearLevel: string;
  dateOfBirth: string;
}

interface ValidationErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  university?: string;
  yearLevel?: string;
  dateOfBirth?: string;
}

// Validation functions
const validateFullName = (name: string): string | undefined => {
  if (name.trim().length === 0) return 'Full name is required';
  if (name.trim().length < 2) return 'Full name must be at least 2 characters';
  if (name.trim().length > 100) return 'Full name must be less than 100 characters';
  return undefined;
};

const validatePhone = (phone: string): string | undefined => {
  if (phone.trim().length === 0) return undefined; // Optional field
  if (phone.trim().length > 35) return 'Phone number must be less than 35 characters';
  
  // Check if it starts with a valid country code
  const hasValidCountryCode = COUNTRY_CODES.some(country => 
    phone.trim().startsWith(country.code)
  );
  
  if (!hasValidCountryCode) return 'Phone number must include a valid country code';
  
  // Basic phone number pattern (country code + digits, spaces, hyphens)
  const phonePattern = /^[\+]\d{1,4}[\d\s\-\(\)]+$/;
  if (!phonePattern.test(phone.trim())) return 'Please enter a valid phone number format';
  
  return undefined;
};

const validateAddress = (address: string): string | undefined => {
  if (address.trim().length > 500) return 'Address must be less than 500 characters';
  return undefined;
};

const validateUniversity = (university: string): string | undefined => {
  if (university.trim().length > 255) return 'University name must be less than 255 characters';
  return undefined;
};

const validateYearLevel = (yearLevel: string): string | undefined => {
  if (yearLevel.trim().length > 50) return 'Year level must be less than 50 characters';
  return undefined;
};

const validateDateOfBirth = (dateOfBirth: string): string | undefined => {
  if (dateOfBirth.trim().length === 0) return undefined; // Optional field
  
  // Check format YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateOfBirth.trim())) {
    return 'Date must be in YYYY-MM-DD format';
  }
  
  // Check if it's a valid date
  const date = new Date(dateOfBirth.trim());
  if (isNaN(date.getTime())) {
    return 'Please enter a valid date';
  }
  
  // Check if date is not in the future
  const today = new Date();
  if (date > today) {
    return 'Date of birth cannot be in the future';
  }
  
  // Check if date is reasonable (not too old)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  if (date < minDate) {
    return 'Please enter a valid birth date';
  }
  
  return undefined;
};

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, refreshUser } = useAuthContext();
  
  // Parse existing phone number to separate country code and number
  const parsePhoneNumber = (fullPhone: string) => {
    if (!fullPhone) return { countryCode: '+63', phoneNumber: '' };
    
    // Try to find a matching country code
    const matchingCode = COUNTRY_CODES.find(country => 
      fullPhone.startsWith(country.code)
    );
    
    if (matchingCode) {
      return {
        countryCode: matchingCode.code,
        phoneNumber: fullPhone.slice(matchingCode.code.length).trim()
      };
    }
    
    // Default to Philippines if no match
    return { countryCode: '+63', phoneNumber: fullPhone };
  };
  
  const parsedPhone = parsePhoneNumber(user?.phone || '');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.fullName || '',
    countryCode: parsedPhone.countryCode,
    phoneNumber: parsedPhone.phoneNumber,
    address: user?.address || '',
    university: user?.university || '',
    yearLevel: user?.yearLevel || '',
    dateOfBirth: user?.dateOfBirth || '',
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear phone validation error when either phone field changes
    if (field === 'countryCode' || field === 'phoneNumber') {
      if (validationErrors.phone) {
        setValidationErrors(prev => ({
          ...prev,
          phone: undefined,
        }));
      }
    }
    
    // Clear validation error for other fields
    if (field !== 'countryCode' && field !== 'phoneNumber' && validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const combinedPhone = formData.phoneNumber ? `${formData.countryCode}${formData.phoneNumber}` : '';
    
    const errors: ValidationErrors = {
      fullName: validateFullName(formData.fullName),
      phone: validatePhone(combinedPhone),
      address: validateAddress(formData.address),
      university: validateUniversity(formData.university),
      yearLevel: validateYearLevel(formData.yearLevel),
      dateOfBirth: validateDateOfBirth(formData.dateOfBirth),
    };

    setValidationErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error !== undefined);
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    // Validate form before submitting
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please correct the errors in the form before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting profile update for user:', user.id);
      console.log('Form data:', formData);
      
      const combinedPhone = formData.phoneNumber ? `${formData.countryCode}${formData.phoneNumber}` : '';
      
      const updateData = {
        fullName: formData.fullName.trim() || undefined,
        phone: combinedPhone.trim() || undefined,
        address: formData.address.trim() || undefined,
        university: formData.university.trim() || undefined,
        yearLevel: formData.yearLevel.trim() || undefined,
        dateOfBirth: formData.dateOfBirth.trim() || undefined,
      };
      
      console.log('Update data to send:', updateData);
      
      const result = await supabaseAuthService.updateProfile(user.id, updateData);
      
      console.log('Update result:', result);

      if (result.success) {
        // Refresh user data to reflect changes immediately
        console.log('Profile updated successfully, refreshing user data...');
        const refreshResult = await refreshUser();
        
        if (refreshResult.success) {
          console.log('User data refreshed successfully');
        } else {
          console.warn('Failed to refresh user data:', refreshResult.error);
        }
        
        Alert.alert(
          'Success!',
          'Your profile has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        console.error('Profile update failed:', result.error);
        Alert.alert(
          'Update Failed', 
          result.error || 'Failed to update profile. Please try again.',
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected error during profile update:', error);
      Alert.alert(
        'Error', 
        `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={[typography.textStyles.h3, styles.headerTitle]}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color={isLoading ? colors.gray[400] : colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.form}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Personal Information</Text>
          
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            autoCapitalize="words"
            error={validationErrors.fullName}
          />

          <PhoneInput
            label="Phone Number"
            countryCode={formData.countryCode}
            phoneNumber={formData.phoneNumber}
            onCountryCodeChange={(code) => handleInputChange('countryCode', code)}
            onPhoneNumberChange={(number) => handleInputChange('phoneNumber', number)}
            error={validationErrors.phone}
          />

          <Input
            label="Address"
            placeholder="Enter your home address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            multiline
            numberOfLines={3}
            error={validationErrors.address}
          />

          {/* Student Information */}
          {(user?.userType === 'tenant') && (
            <>
              <Text style={[typography.textStyles.h4, styles.sectionTitle, styles.sectionTitleSpaced]}>
                Student Information
              </Text>
              
              <Dropdown
                label="University"
                placeholder="Select your university"
                options={POPULAR_SCHOOLS.map(school => ({
                  label: school.name,
                  value: school.name,
                  description: school.location,
                }))}
                value={formData.university}
                onSelect={(value) => handleInputChange('university', value)}
                error={validationErrors.university}
              />

              <Input
                label="Year Level"
                placeholder="e.g., 1st Year, 2nd Year, 3rd Year, 4th Year"
                value={formData.yearLevel}
                onChangeText={(value) => handleInputChange('yearLevel', value)}
                error={validationErrors.yearLevel}
              />
            </>
          )}

          <Input
            label="Date of Birth (Optional)"
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange('dateOfBirth', value)}
            keyboardType="numeric"
            error={validationErrors.dateOfBirth}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveButtonLarge}
          />
          
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.gray[900],
    fontFamily: 'Figtree_600SemiBold',
  },
  saveButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    color: colors.gray[900],
    marginBottom: 8,
  },
  sectionTitleSpaced: {
    marginTop: 16,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  saveButtonLarge: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    borderColor: colors.gray[300],
  },
});