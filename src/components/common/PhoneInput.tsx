import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown, DropdownOption } from './Dropdown';
import { Input } from './Input';
import { COUNTRY_CODES } from '../../utils/constants';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

interface PhoneInputProps {
  label?: string;
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  error,
  disabled = false,
}) => {
  const countryCodeOptions: DropdownOption[] = COUNTRY_CODES.map(country => ({
    label: `${country.code}`,
    value: country.code,
    description: country.country,
    icon: country.flag,
  }));

  const validatePhoneNumber = (number: string): string => {
    // Remove any non-digit characters for validation
    const digitsOnly = number.replace(/\D/g, '');
    
    // Format with spaces for display (every 3-4 digits)
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    if (digitsOnly.length <= 10) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
    
    // Limit to 10 digits for Philippines format
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 10)}`;
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatted = validatePhoneNumber(text);
    onPhoneNumberChange(formatted);
  };

  const getPlaceholder = () => {
    switch (countryCode) {
      case '+63':
        return '912 345 6789';
      case '+1':
        return '555 123 4567';
      default:
        return '123 456 7890';
    }
  };

  const getMaxLength = () => {
    switch (countryCode) {
      case '+63':
        return 13; // "912 345 6789" format
      case '+1':
        return 12; // "555 123 4567" format
      default:
        return 13;
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[typography.textStyles.body, styles.label]}>{label}</Text>}
      
      <View style={styles.phoneContainer}>
        <View style={styles.countryCodeContainer}>
          <Dropdown
            placeholder="Code"
            options={countryCodeOptions}
            value={countryCode}
            onSelect={onCountryCodeChange}
            disabled={disabled}
          />
        </View>
        
        <View style={styles.phoneNumberContainer}>
          <Input
            placeholder={getPlaceholder()}
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            maxLength={getMaxLength()}
          />
        </View>
      </View>
      
      {error && <Text style={[typography.textStyles.bodySmall, styles.error]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  label: {
    marginBottom: 8,
    color: colors.gray[700],
    fontWeight: '500',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeContainer: {
    width: 120,
  },
  phoneNumberContainer: {
    flex: 1,
  },
  error: {
    color: colors.error,
    marginTop: 4,
  },
});