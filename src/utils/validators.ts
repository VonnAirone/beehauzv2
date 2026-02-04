// Validation functions

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

// Validate single field
export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || 'This field is required';
    }
    
    if (value && rule.minLength && value.toString().length < rule.minLength) {
      return rule.message || `Minimum length is ${rule.minLength} characters`;
    }
    
    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message || `Maximum length is ${rule.maxLength} characters`;
    }
    
    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      return rule.message || 'Invalid format';
    }
    
    if (value && rule.custom && !rule.custom(value)) {
      return rule.message || 'Invalid value';
    }
  }
  
  return null;
};

// Validate entire form
export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  for (const field in rules) {
    const fieldError = validateField(data[field], rules[field]);
    if (fieldError) {
      errors[field] = fieldError;
    }
  }
  
  return errors;
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name should only contain letters and spaces',
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
  positiveNumber: {
    custom: (value: any) => !isNaN(value) && parseFloat(value) > 0,
    message: 'Must be a positive number',
  },
};