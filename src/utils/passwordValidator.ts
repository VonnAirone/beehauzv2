/**
 * Password Validation Utility
 * Implements strong password requirements to prevent brute force attacks
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

// Default password requirements for new users
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @param requirements - Custom requirements (optional, uses defaults if not provided)
 * @returns PasswordValidationResult with validation status and errors
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters`);
  }

  // Check for uppercase letters
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  // Determine password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (errors.length === 0) {
    // All requirements met - determine strength based on length and variety
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const varietyCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;

    if (password.length >= 16 && varietyCount >= 4) {
      strength = 'strong';
    } else if (password.length >= 12 && varietyCount >= 3) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Gets a user-friendly error message from validation result
 * @param result - The password validation result
 * @returns A formatted error message string
 */
export function getPasswordErrorMessage(result: PasswordValidationResult): string {
  if (result.isValid) {
    return '';
  }

  if (result.errors.length === 1) {
    return result.errors[0];
  }

  return 'Password must meet the following requirements:\n' + result.errors.map(e => `• ${e}`).join('\n');
}

/**
 * Gets password strength label and color
 * @param strength - The password strength
 * @returns Object with label and color for UI display
 */
export function getPasswordStrengthDisplay(strength: 'weak' | 'medium' | 'strong'): {
  label: string;
  color: string;
} {
  switch (strength) {
    case 'strong':
      return { label: 'Strong', color: '#10b981' }; // Green
    case 'medium':
      return { label: 'Medium', color: '#f59e0b' }; // Orange
    case 'weak':
    default:
      return { label: 'Weak', color: '#ef4444' }; // Red
  }
}
